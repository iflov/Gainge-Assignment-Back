import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';
import { IPostsRepository } from './interfaces/posts-repository.interface';
import { CreatePostInput } from './dtos/create-post.input';

@Injectable()
export class PostsRepository implements IPostsRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * 모든 게시글 조회
     */
    async findAll(): Promise<Post[]> {
        return this.prisma.post.findMany();
    }

    /**
     * 게시글 생성
     */
    async create(data: CreatePostInput): Promise<Post> {
        return this.prisma.post.create({
            data: {
                title: data.title,
                content: data.content || '',
                authorId: data.authorId,
                password: data.password,
            },
        });
    }

    /**
     * 게시글 상세 조회
     */
    async findOne(postId: number): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id: postId },
        });
    }
}
