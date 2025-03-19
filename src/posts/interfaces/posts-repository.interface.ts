import { Post } from '@prisma/client';
import { CreatePostInput } from '../dtos/create-post.input';
import { UpdatePostInput } from '../dtos/update-post.input';

export interface IPostsRepository {
    /**
     * 모든 게시글 조회
     */
    findAll(): Promise<Post[]>;

    /**
     * 게시글 생성
     */
    create(data: CreatePostInput): Promise<Post>;

    /**
     * 게시글 상세 조회
     */
    findOne(postId: number): Promise<Post | null>;

    /**
     * 게시글 수정
     */
    update(id: number, data: UpdatePostInput): Promise<Post>;
}
