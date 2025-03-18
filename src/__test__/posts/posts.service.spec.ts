import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../posts/posts.service';
import { PostsRepository } from '../../posts/posts.repository';
import { CreatePostInput } from '../../src/posts/dto/create-post.input';
import { Post } from '../../posts/entities/posts.model';

describe('PostsService', () => {
    let service: PostsService;
    let repository: PostsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: PostsRepository,
                    useValue: {
                        findAll: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        repository = module.get<PostsRepository>(PostsRepository);
    });

    it('서비스가 정상적으로 정의됨', () => {
        expect(service).toBeDefined();
    });

    // ✅ 게시글 목록 조회 테스트
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

    // ✅ 게시글 생성 테스트
    describe('createPost', () => {
        it('게시글을 생성할 수 있어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content',
                authorId: 'user123',
                password: 'hashedpassword123',
            };

            const mockPost: Post = {
                id: 1,
                ...createPostInput,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'create').mockResolvedValue(mockPost);

            const result = await service.create(createPostInput);
            expect(result).toEqual(mockPost);
            expect(repository.create).toHaveBeenCalledWith(createPostInput);
        });
    });
});
