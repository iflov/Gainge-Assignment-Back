import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private readonly postsRepository: PostsRepository) {}

    async findAll(): Promise<Post[]> {
        return this.postsRepository.findAll();
    }
}
