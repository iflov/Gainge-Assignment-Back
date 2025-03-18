import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { PostsRepository } from './posts.repository';

@Module({
    providers: [PostsService, PostsResolver, PrismaService, PostsRepository],
})
export class PostsModule {}
