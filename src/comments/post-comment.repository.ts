import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostComment } from '@prisma/client';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import { IPostCommentsRepository } from './interfaces/posts-comment-repository.interface';

@Injectable()
export class PostCommentsRepository implements IPostCommentsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // DB에서 게시글의 Id를 기준으로 게시글과 댓글의 id 찾기
    async findByPostId(postId: number): Promise<PostComment[]> {
        return this.prisma.postComment.findMany({
            where: { postId },
        });
    }

    // DB에서 댓글 생성
    async create(data: CreatePostCommentInput & { password: string }): Promise<PostComment> {
        return this.prisma.postComment.create({
            data: {
                content: data.content,
                authorId: data.authorId,
                password: data.password,
                postId: data.postId,
            },
        });
    }

    // DB에서 댓글 id로 댓글 조회
    findOne(commentId: number): Promise<PostComment | null> {
        return this.prisma.postComment.findUnique({
            where: { id: commentId },
        });
    }

    // DB에서 댓글 수정
    async update(id: number, data: Partial<Pick<PostComment, 'content'>>): Promise<PostComment> {
        return this.prisma.postComment.update({
            where: { id },
            data,
        });
    }

    // DB에서 댓글 삭제
    async delete(id: number): Promise<PostComment> {
        return this.prisma.postComment.delete({
            where: { id },
        });
    }
}
