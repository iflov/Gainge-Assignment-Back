import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../posts/interfaces/posts-repository.interface';
import { Post } from '@prisma/client';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import * as bcrypt from 'bcrypt';
import { IPostCommentsRepository } from './interfaces/posts-comment-repository.interface';
import { PostComment as GraphQLPostComment } from './entities/post-comment.model';

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
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        // 댓글과 게시물 정보 조회
        const comments = await this.commentsRepository.findByPostId(postId);

        // 각 댓글에 게시물 정보 추가
        return comments.map((comment) => ({
            ...comment,
            post: post as Post,
        }));
    }
}
