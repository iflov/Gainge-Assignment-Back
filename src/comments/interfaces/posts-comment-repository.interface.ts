import { PostComment } from '@prisma/client';
import { CreatePostCommentInput } from '../dtos/create-post-comment.input';

export interface IPostCommentsRepository {
    /**
     * 특정 게시글의 모든 댓글 조회
     */
    findByPostId(postId: number): Promise<PostComment[]>;

    /**
     * 댓글 생성
     */
    create(data: CreatePostCommentInput & { password: string }): Promise<PostComment>;

    /**
     * 특정 댓글 상세 조회
     */
    findOne(commentId: number): Promise<PostComment | null>;

    /**
     * 댓글 수정
     */
    update(id: number, data: Partial<Pick<PostComment, 'content'>>): Promise<PostComment>;

    /**
     * 댓글 삭제
     */
    delete(id: number): Promise<PostComment>;
}
