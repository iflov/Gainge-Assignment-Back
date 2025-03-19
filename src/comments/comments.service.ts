import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../posts/interfaces/posts-repository.interface';
import { Post } from '@prisma/client';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import * as bcrypt from 'bcrypt';
import { IPostCommentsRepository } from './interfaces/posts-comment-repository.interface';
import { PostComment as GraphQLPostComment } from './entities/post-comment.model';
import { UpdatePostCommentInput } from './dtos/update-post-comment.input';
import { DeletePostCommentInput } from './dtos/delete-post-comment.input';

@Injectable()
export class CommentsService {
    constructor(
        @Inject('IPostCommentsRepository')
        private readonly commentsRepository: IPostCommentsRepository,
        @Inject('IPostsRepository')
        private readonly postsRepository: IPostsRepository,
    ) {}

    async create(data: CreatePostCommentInput): Promise<GraphQLPostComment> {
        // 내용 검증
        if (!data.content) {
            throw new BadRequestException('댓글 내용은 필수입니다.');
        }
        if (!data.authorId) {
            throw new BadRequestException('작성자 ID는 필수입니다.');
        }
        if (!data.password) {
            throw new BadRequestException('비밀번호는 필수입니다.');
        }

        // 게시글 존재 확인
        const post = await this.postsRepository.findOne(data.postId);
        if (!post) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 댓글 생성
        const createdComment = await this.commentsRepository.create({
            ...data,
            password: hashedPassword,
        });

        // GraphQL 모델로 변환
        return {
            ...createdComment,
            post: post as Post,
        };
    }

    async findByPostId(postId: number): Promise<GraphQLPostComment[]> {
        // 게시글 존재 확인
        const post = await this.postsRepository.findOne(postId);
        if (!post) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.'); // post repository에서 해당 id의 게시물이 없으면 null처리하므로 예외처리 추가
        }

        // 댓글과 게시물 정보 조회
        const comments = await this.commentsRepository.findByPostId(postId);

        // 각 댓글에 게시물 정보 추가
        return comments.map((comment) => ({
            ...comment,
            post: post as Post,
        }));
    }

    async update(commentId: number, data: UpdatePostCommentInput): Promise<GraphQLPostComment> {
        // 댓글 존재 확인
        const existingComment = await this.commentsRepository.findOne(commentId);
        if (!existingComment) {
            throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
        }

        // 작성자 ID 일치 확인
        if (existingComment.authorId !== data.authorId) {
            throw new BadRequestException('댓글 작성자만 수정할 수 있습니다.');
        }

        // 비밀번호 일치 확인
        const isPasswordValid = await bcrypt.compare(data.password, existingComment.password);
        if (!isPasswordValid) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        // 업데이트할 데이터 준비
        const updateData: Partial<Pick<GraphQLPostComment, 'content'>> = {};
        if (data.content !== undefined) {
            updateData.content = data.content;
        }

        // 댓글 업데이트
        const updatedComment = await this.commentsRepository.update(commentId, updateData);

        // 게시글 정보 조회
        const post = await this.postsRepository.findOne(existingComment.postId);

        // GraphQL 모델로 변환
        return {
            ...updatedComment,
            post: post as Post,
        };
    }

    async delete(commentId: number, data: DeletePostCommentInput): Promise<GraphQLPostComment> {
        // 댓글 존재 확인
        const existingComment = await this.commentsRepository.findOne(commentId);
        if (!existingComment) {
            throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
        }

        // 작성자 ID 일치 확인
        if (existingComment.authorId !== data.authorId) {
            throw new BadRequestException('댓글 작성자만 삭제할 수 있습니다.');
        }

        // 비밀번호 일치 확인
        const isPasswordValid = await bcrypt.compare(data.password, existingComment.password);
        if (!isPasswordValid) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        // 게시글 정보 조회
        const post = await this.postsRepository.findOne(existingComment.postId);

        // 댓글 삭제
        const deletedComment = await this.commentsRepository.delete(commentId);

        // GraphQL 모델로 변환
        return {
            ...deletedComment,
            post: post as Post,
        };
    }
}
