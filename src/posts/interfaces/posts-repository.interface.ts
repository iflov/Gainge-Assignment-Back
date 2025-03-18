// src/posts/interfaces/posts-repository.interface.ts
import { Post } from '@prisma/client';
import { CreatePostInput } from '../dtos/create-post.input';

export interface IPostsRepository {
    /**
     * 모든 게시글 조회
     */
    findAll(): Promise<Post[]>;

    /**
     * 게시글 생성
     */
    create(data: CreatePostInput): Promise<Post>;
}
