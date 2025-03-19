import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/posts.model';
import { CreatePostInput } from './dtos/create-post.input';
import { UpdatePostInput } from './dtos/update-post.input';
import { DeletePostInput } from './dtos/delete-post.input';

@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}

    /**
     * 게시글 목록 조회
     * @returns 모든 게시글 배열 반환
     */
    @Query(() => [Post], { name: 'posts' })
    async getPosts(): Promise<Post[]> {
        return this.postsService.findAll();
    }

    @Query(() => Post) // 추가된 부분
    post(@Args('id', { type: () => Int }) id: number): Promise<Post> {
        return this.postsService.findOne(id);
    }

    /**
     * 게시글 생성
     * @param input 생성할 게시글 정보
     * @returns 생성된 게시글
     */
    @Mutation(() => Post, { name: 'create_post' })
    async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
        return this.postsService.create(input);
    }

    @Mutation(() => Post)
    async updatePost(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: UpdatePostInput,
    ): Promise<Post> {
        return this.postsService.update(id, input);
    }

    @Mutation(() => Post)
    async deletePost(
        @Args('id', { type: () => Int }) id: number,
        @Args('input') input: DeletePostInput,
    ): Promise<Post> {
        return this.postsService.delete(id, input);
    }
}
