// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { PostsRepository } from './posts.repository';

@Module({
    providers: [
        PostsResolver,
        PrismaService,
        {
            provide: 'IPostsRepository',
            useClass: PostsRepository,
        },
        PostsService,
    ],
})
export class PostsModule {}
