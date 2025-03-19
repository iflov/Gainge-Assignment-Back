import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from './interfaces/posts-repository.interface';
import { Post } from '@prisma/client';
import { CreatePostInput } from './dtos/create-post.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PostsService {
    constructor(
        @Inject('IPostsRepository')
        private readonly postsRepository: IPostsRepository,
    ) {}

    async findAll(): Promise<Post[]> {
        return this.postsRepository.findAll();
    }

    async create(data: CreatePostInput): Promise<Post> {
        if (!data.title) {
            throw new BadRequestException('제목은 필수입니다.');
        }
        if (!data.password) {
            throw new BadRequestException('비밀번호는 필수입니다.');
        }
        if (!data.authorId) {
            throw new BadRequestException('작성자 ID는 필수입니다.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.postsRepository.create({
            ...data,
            content: data.content ?? null,
            password: hashedPassword,
        });
    }

    async findOne(postId: number): Promise<Post> {
        const post = await this.postsRepository.findOne(postId);

        if (!post) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        return post;
    }
}
