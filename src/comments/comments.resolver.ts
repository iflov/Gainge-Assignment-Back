import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import { PostComment } from './entities/post-comment.model';
import { UpdatePostCommentInput } from './dtos/update-post-comment.input';
import { DeletePostCommentInput } from './dtos/delete-post-comment.input';

@Resolver(() => PostComment)
export class CommentsResolver {
    constructor(private readonly commentsService: CommentsService) {}

    // 댓글 조회
    @Query(() => [PostComment])
    async getPostComments(
        @Args('postId', { type: () => Int }) postId: number,
    ): Promise<PostComment[]> {
        return this.commentsService.findByPostId(postId);
    }

    // 댓글 작성
    @Mutation(() => PostComment, { name: 'create_post_comment' })
    async createPostComment(@Args('input') input: CreatePostCommentInput): Promise<PostComment> {
        return this.commentsService.create(input);
    }

    // 댓글 수정
    @Mutation(() => PostComment)
    async updatePostComment(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: UpdatePostCommentInput,
    ): Promise<PostComment> {
        return this.commentsService.update(id, input);
    }

    // 댓글 삭제
    @Mutation(() => PostComment)
    async deletePostComment(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: DeletePostCommentInput,
    ): Promise<PostComment> {
        return this.commentsService.delete(id, input);
    }
}
