import { Test, TestingModule } from '@nestjs/testing';
import { PostsResolver } from '../../posts/posts.resolver';
import { PostsService } from '../../posts/posts.service';
import { CreatePostInput } from '../../posts/dtos/create-post.input';
import { Post } from '../../posts/entities/posts.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PostsResolver', () => {
    let resolver: PostsResolver;
    let service: PostsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsResolver,
                {
                    provide: PostsService,
                    useValue: {
                        findAll: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<PostsResolver>(PostsResolver);
        service = module.get<PostsService>(PostsService);
    });

    describe('getPosts', () => {
        it('모든 게시글을 조회할 수 있어야 한다.', async () => {
            const mockPosts: Post[] = [
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

            jest.spyOn(service, 'findAll').mockResolvedValue(mockPosts);

            const result = await resolver.getPosts();
            expect(result).toEqual(mockPosts);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('게시글이 없을 때 빈 배열을 반환해야 한다.', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValue([]);

            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('데이터베이스 오류가 발생하면 예외를 던져야 한다.', async () => {
            jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Database error'));

            await expect(resolver.getPosts()).rejects.toThrow('Database error');
        });
    });

    describe('createPost', () => {
        it('새로운 게시글을 생성할 수 있어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content',
                authorId: 'user123',
                password: 'password',
            };

            const mockCreatedPost: Post = {
                id: 1,
                title: createPostInput.title,
                content: createPostInput.content || '',
                authorId: createPostInput.authorId,
                password: createPostInput.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockCreatedPost);

            const result = await resolver.createPost(createPostInput);
            expect(result).toEqual(mockCreatedPost);
            expect(service.create).toHaveBeenCalledWith(createPostInput);
        });

        it('제목이 없으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: '', // 제목 없음
                content: 'Test Content',
                authorId: 'user123',
                password: 'password',
            };

            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException('제목을 입력해야 합니다.');
            });

            await expect(resolver.createPost(createPostInput)).rejects.toThrow(BadRequestException);
        });

        it('비밀번호가 없으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Valid Title',
                content: 'Test Content',
                authorId: 'user123',
                password: '', // 비밀번호 없음
            };

            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException('비밀번호를 입력해야 합니다.');
            });

            await expect(resolver.createPost(createPostInput)).rejects.toThrow(BadRequestException);
        });

        it('작성자 ID가 없으면 게시글을 생성할 수 없어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Valid Title',
                content: 'Test Content',
                authorId: '', // 작성자 ID 없음
                password: 'password',
            };

            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException('작성자 ID를 입력해야 합니다.');
            });

            await expect(resolver.createPost(createPostInput)).rejects.toThrow(BadRequestException);
        });
    });

    describe('post', () => {
        it('특정 ID의 게시글을 조회할 수 있어야 한다.', async () => {
            const postId = 1;
            const mockPost: Post = {
                id: postId,
                title: 'Test Post',
                content: 'Hello',
                authorId: 'user123',
                password: 'hashedpassword123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(mockPost);

            const result = await resolver.post(postId);
            expect(result).toEqual(mockPost);
            expect(service.findOne).toHaveBeenCalledWith(postId);
        });

        it('존재하지 않는 게시글 조회 시 예외를 던져야 한다.', async () => {
            const postId = 999;
            jest.spyOn(service, 'findOne').mockRejectedValue(
                new NotFoundException('해당 게시글을 찾을 수 없습니다.'),
            );

            await expect(resolver.post(postId)).rejects.toThrow(NotFoundException);
        });

        it('데이터베이스 오류가 발생하면 예외를 던져야 한다.', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));

            await expect(resolver.post(1)).rejects.toThrow('Database error');
        });
    });
});
