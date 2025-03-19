import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { CreatePostCommentInput } from './dtos/create-post-comment.input';
import { PostComment } from './entities/post-comment.model';
import { UpdatePostCommentInput } from './dtos/update-post-comment.input';

@Resolver(() => PostComment)
export class CommentsResolver {
    constructor(private readonly commentsService: CommentsService) {}

    @Query(() => [PostComment])
    async postComments(
        @Args('postId', { type: () => Int }) postId: number,
    ): Promise<PostComment[]> {
        return this.commentsService.findByPostId(postId);
    }

    @Mutation(() => PostComment, { name: 'create_post_comment' })
    async createPostComment(@Args('input') input: CreatePostCommentInput): Promise<PostComment> {
        return this.commentsService.create(input);
    }

    @Mutation(() => PostComment)
    async updatePostComment(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: UpdatePostCommentInput,
    ): Promise<PostComment> {
        return this.commentsService.update(id, input);
    }
}
