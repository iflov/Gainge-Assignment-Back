import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../posts/posts.service';
import { BadRequestException } from '@nestjs/common';
import { IPostsRepository } from '../../posts/interfaces/posts-repository.interface';
import { CreatePostInput } from '../../posts/dtos/create-post.input';
import { Post } from '@prisma/client';

describe('PostsService', () => {
    let service: PostsService;
    let repository: IPostsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: 'IPostsRepository',
                    useValue: {
                        findAll: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        repository = module.get<IPostsRepository>('IPostsRepository');
    });

    it('서비스가 정상적으로 정의됨', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('게시글 목록을 조회할 수 있어야 한다.', async () => {
            const mockPosts = [
                {
                    id: 1,
                    title: 'Test Post',
                    content: 'Hello',
                    authorId: 'user123',
                    password: 'hashedpassword123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(repository, 'findAll').mockResolvedValue(mockPosts);

            const result = await service.findAll();
            expect(result).toEqual(mockPosts);
        });

        it('게시글이 없을 때 빈 배열을 반환해야 한다.', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([]);

            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('findAll 호출 실패 시 예외를 처리해야 한다.', async () => {
            jest.spyOn(repository, 'findAll').mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow('Database error');
        });
    });

    // 게시글 생성 테스트
    describe('createPost', () => {
        it('게시글을 생성할 수 있어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content', // content는 선택적 필드
                authorId: 'user123',
                password: 'hashedpassword123',
            };

            // Post 타입에 맞게 mockPost 정의
            const mockPost: Post = {
                id: 1,
                title: createPostInput.title,
                content: createPostInput.content || '', // 선택적 필드로 처리
                authorId: createPostInput.authorId,
                password: createPostInput.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'create').mockResolvedValue(mockPost);

            const result = await service.create(createPostInput);
            expect(result).toEqual(mockPost);
            expect(repository.create).toHaveBeenCalledWith(createPostInput);
        });

        it('제목이 비어있으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: '', // 제목 없음
                content: 'Test Content',
                authorId: 'user123',
                password: 'hashedpassword123',
            };

            await expect(service.create(createPostInput)).rejects.toThrow(BadRequestException);
        });

        it('비밀번호가 비어있으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Valid Title',
                content: 'Test Content',
                authorId: 'user123',
                password: '', // 비밀번호 없음
            };

            await expect(service.create(createPostInput)).rejects.toThrow(BadRequestException);
        });

        it('작성자 아이디가 없으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content',
                authorId: '', // 작성자 아이디 없음,
                password: 'hashedpassword123',
            };

            await expect(service.create(createPostInput)).rejects.toThrow(BadRequestException);
        });
    });

    it('데이터베이스 오류가 발생하면 예외를 던져야 한다.', async () => {
        const createPostInput: CreatePostInput = {
            title: 'Test Title',
            content: 'Test Content',
            authorId: 'user123',
            password: 'hashedpassword123',
        };

        jest.spyOn(repository, 'create').mockRejectedValue(new Error('Database error'));

        await expect(service.create(createPostInput)).rejects.toThrow('Database error');
    });
});
