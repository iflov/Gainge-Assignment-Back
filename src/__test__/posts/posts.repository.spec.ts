import { Test, TestingModule } from '@nestjs/testing';
import { PostsRepository } from '../../posts/posts.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostInput } from '../../posts/dtos/create-post.input';
import { Post } from '@prisma/client';
import { UpdatePostInput } from '../../posts/dtos/update-post.input';

describe('PostsRepository', () => {
    let repository: PostsRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        post: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        repository = module.get<PostsRepository>(PostsRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('findAll', () => {
        it('모든 게시글을 조회할 수 있어야 한다.', async () => {
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

            jest.spyOn(prismaService.post, 'findMany').mockResolvedValue(mockPosts);

            const result = await repository.findAll();
            expect(result).toEqual(mockPosts);
            expect(prismaService.post.findMany).toHaveBeenCalled();
        });

        it('게시글이 없을 때 빈 배열을 반환해야 한다.', async () => {
            jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);

            const result = await repository.findAll();
            expect(result).toEqual([]);
            expect(prismaService.post.findMany).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('새로운 게시글을 생성할 수 있어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content',
                authorId: 'user123',
                password: 'hashedpassword123',
            };

            const mockCreatedPost: Post = {
                id: 1,
                title: 'Test Title',
                content: 'Test Content', // or null
                authorId: 'user123',
                password: 'hashedpassword123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.post, 'create').mockResolvedValue(mockCreatedPost);

            const result = await repository.create(createPostInput);
            expect(result).toEqual(mockCreatedPost);
            expect(prismaService.post.create).toHaveBeenCalledWith({
                data: {
                    title: createPostInput.title,
                    content: createPostInput.content || '',
                    authorId: createPostInput.authorId,
                    password: createPostInput.password,
                },
            });
        });
    });

    describe('findOne', () => {
        it('특정 ID의 게시글을 조회할 수 있어야 한다.', async () => {
            const postId = 1;
            const mockPost = {
                id: postId,
                title: 'Test Post',
                content: 'Hello',
                authorId: 'user123',
                password: 'hashedpassword123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);

            const result = await repository.findOne(postId);
            expect(result).toEqual(mockPost);
            expect(prismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: postId },
            });
        });

        it('존재하지 않는 게시글 조회 시 null을 반환해야 한다.', async () => {
            const postId = 999;

            jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

            const result = await repository.findOne(postId);
            expect(result).toBeNull();
            expect(prismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: postId },
            });
        });
    });

    describe('update', () => {
        it('게시글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const postId = 1;
            const updateData: Partial<UpdatePostInput> = {
                title: '수정된 제목',
                content: '수정된 내용',
            };

            const mockUpdatedPost: Post = {
                id: postId,
                title: updateData.title || '원본 제목',
                content: updateData.content || '원본 내용',
                authorId: 'user123',
                password: 'hashedpassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // 명시적으로 타입을 지정하여 모킹
            jest.spyOn(prismaService.post, 'update').mockResolvedValue(mockUpdatedPost);

            const result = await repository.update(postId, updateData);

            expect(result).toEqual(mockUpdatedPost);
            expect(prismaService.post.update).toHaveBeenCalledWith({
                where: { id: postId },
                data: updateData,
            });
        });
    });
});
