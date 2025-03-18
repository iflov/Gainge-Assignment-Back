import { Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/posts.model';

@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}

    /**
     * 게시글 목록 조회
     * @returns 모든 게시글 배열 반환
     */
    @Query(() => [Post], { name: 'posts' })
    async getPosts(): Promise<Post[]> {
        return this.postsService.findAll(); // 서비스에서 모든 게시글 조회
    }
}
