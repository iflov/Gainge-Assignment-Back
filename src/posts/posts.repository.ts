import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * 모든 게시글 조회
     */
    async findAll(): Promise<Post[]> {
        return this.prisma.post.findMany();
    }
}
