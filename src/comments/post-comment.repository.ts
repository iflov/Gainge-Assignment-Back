import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostComment } from '@prisma/client';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import { IPostCommentsRepository } from './interfaces/posts-comment-repository.interface';

@Injectable()
export class PostCommentsRepository implements IPostCommentsRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * 특정 게시글의 모든 댓글 조회
     */
    async findByPostId(postId: number): Promise<PostComment[]> {
        return this.prisma.postComment.findMany({
            where: { postId },
        });
    }

    /**
     * 댓글 생성
     */
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

    /**
     * 특정 댓글 상세 조회
     */
    async findOne(commentId: number): Promise<PostComment | null> {
        return this.prisma.postComment.findUnique({
            where: { id: commentId },
        });
    }

    /**
     * 댓글 수정
     */
    async update(id: number, data: Partial<Pick<PostComment, 'content'>>): Promise<PostComment> {
        return this.prisma.postComment.update({
            where: { id },
            data,
        });
    }

    /**
     * 댓글 삭제
     */
    async delete(id: number): Promise<PostComment> {
        return this.prisma.postComment.delete({
            where: { id },
        });
    }
}
