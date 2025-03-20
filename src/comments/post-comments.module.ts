import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsResolver } from './post-comments.resolver';
import { PostsRepository } from '../posts/posts.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PostCommentsRepository } from './post-comment.repository';

@Module({
    providers: [
        PostCommentsResolver,
        PostCommentsService,
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
export class PostCommentsModule {}
