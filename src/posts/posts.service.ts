import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from './interfaces/posts-repository.interface';
import { Post } from '@prisma/client';
import { CreatePostInput } from './dtos/create-post.input';
import { UpdatePostInput } from './dtos/update-post.input';
import { DeletePostInput } from './dtos/delete-post.input';
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

    async update(postId: number, data: UpdatePostInput): Promise<Post> {
        // 게시글 존재 확인
        const existingPost = await this.postsRepository.findOne(postId);

        if (!existingPost) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        // 작성자 ID 일치 확인
        if (existingPost.authorId !== data.authorId) {
            throw new BadRequestException('게시글 작성자만 수정할 수 있습니다.');
        }

        // 비밀번호 일치 확인
        const isPasswordValid = await bcrypt.compare(data.password, existingPost.password);

        if (!isPasswordValid) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        // 업데이트할 데이터 준비 (title, content만 업데이트 가능)
        const updateData: Partial<Omit<Post, 'authorId' | 'password'>> = {};
        if (data.title !== undefined) {
            updateData.title = data.title;
        }
        if (data.content !== undefined) {
            updateData.content = data.content;
        }

        // 게시글 업데이트
        return this.postsRepository.update(postId, updateData);
    }

    async delete(postId: number, data: DeletePostInput): Promise<Post> {
        // 게시글 존재 확인
        const existingPost = await this.postsRepository.findOne(postId);

        if (!existingPost) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        // 작성자 ID 일치 확인
        if (existingPost.authorId !== data.authorId) {
            throw new BadRequestException('게시글 작성자만 삭제할 수 있습니다.');
        }

        // 비밀번호 일치 확인
        const isPasswordValid = await bcrypt.compare(data.password, existingPost.password);

        if (!isPasswordValid) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        // 게시글 삭제
        return this.postsRepository.delete(postId);
    }
}
