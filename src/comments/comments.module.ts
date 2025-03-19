import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { PostsRepository } from '../posts/posts.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PostCommentsRepository } from './post-comment.repository';

@Module({
    providers: [
        CommentsResolver,
        CommentsService,
        PrismaService,
        {
            provide: 'IPostCommentsRepository',
            useClass: PostCommentsRepository,
        },
        {
            provide: 'IPostsRepository',
            useClass: PostsRepository,
        },
    ],
})
export class CommentsModule {}
