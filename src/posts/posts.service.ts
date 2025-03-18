import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPostsRepository } from './interfaces/posts-repository.interface';
import { Post } from '@prisma/client';
import { CreatePostInput } from './dtos/create-post.input';

@Injectable()
export class PostsService {
    constructor(
        @Inject('IPostsRepository')
        private readonly postsRepository: IPostsRepository,
    ) {}

    /**
     * 모든 게시글 조회
     */
    async findAll(): Promise<Post[]> {
        return this.postsRepository.findAll();
    }

    /**
     * 게시글 생성
     * @param data 게시글 생성 입력값
     * @returns 생성된 게시글 반환
     */
    async create(data: CreatePostInput): Promise<Post> {
        // 유효성 검사
        if (!data.title) {
            throw new BadRequestException('제목은 필수입니다.');
        }
        if (!data.password) {
            throw new BadRequestException('비밀번호는 필수입니다.');
        }
        if (!data.authorId) {
            throw new BadRequestException('작성자 ID는 필수입니다.');
        }

        return this.postsRepository.create(data);
    }
}
