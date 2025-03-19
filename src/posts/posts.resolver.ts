import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/posts.model';
import { CreatePostInput } from './dtos/create-post.input';
import { UpdatePostInput } from './dtos/update-post.input';
import { DeletePostInput } from './dtos/delete-post.input';

@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}

    // 게시글 전체 조회
    @Query(() => [Post], { name: 'posts' })
    async getPosts(): Promise<Post[]> {
        return this.postsService.findAll();
    }

    // 게시글 상세 조회
    @Query(() => Post)
    post(@Args('id', { type: () => Int }) id: number): Promise<Post | null> {
        return this.postsService.findOne(id);
    }

    // 게시글 생성
    @Mutation(() => Post, { name: 'create_post' })
    async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
        return this.postsService.create(input);
    }

    // 게시글 수정
    @Mutation(() => Post)
    async updatePost(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: UpdatePostInput,
    ): Promise<Post> {
        return this.postsService.update(id, input);
    }

    // 게시글 삭제
    @Mutation(() => Post)
    async deletePost(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: DeletePostInput,
    ): Promise<Post> {
        return this.postsService.delete(id, input);
    }
}
