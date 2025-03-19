import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../posts/posts.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IPostsRepository } from '../../posts/interfaces/posts-repository.interface';
import { CreatePostInput } from '../../posts/dtos/create-post.input';
import { Post } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdatePostInput } from '../../posts/dtos/update-post.input';
import { DeletePostInput } from '../../posts/dtos/delete-post.input';

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
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
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

    describe('createPost', () => {
        it('게시글을 생성할 수 있어야 한다.', async () => {
            const createPostInput: CreatePostInput = {
                title: 'Test Title',
                content: 'Test Content',
                authorId: 'user123',
                password: 'password',
            };

            const repositoryCreateSpy = jest
                .spyOn(repository, 'create')
                .mockImplementation(async (data) => {
                    expect(data.password).not.toBe(createPostInput.password);

                    return {
                        id: 1,
                        ...data,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    } as Post;
                });

            const bcryptSpy = jest.spyOn(bcrypt, 'hash');

            await service.create(createPostInput);

            expect(bcryptSpy).toHaveBeenCalledWith(createPostInput.password, 10);
            expect(repositoryCreateSpy).toHaveBeenCalled();
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

    describe('findOne', () => {
        it('존재하는 게시글을 조회할 수 있어야 한다.', async () => {
            const mockPost: Post = {
                id: 1,
                title: 'test post title',
                content: 'test post content',
                authorId: 'user123',
                password: 'hashedPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(mockPost);

            const result = await service.findOne(1);
            expect(result).toEqual(mockPost);
        });

        it('존재하지 않는 게시글 조회 시 예외를 던져야 한다.', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow('해당 게시글을 찾을 수 없습니다.');
        });

        it('데이터베이스 오류가 발생하면 예외를 던져야 한다.', async () => {
            jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Database error'));

            await expect(service.findOne(1)).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        const postId = 1;
        const updatePostInput: UpdatePostInput = {
            title: '수정된 제목',
            content: '수정된 내용',
            authorId: 'user123',
            password: 'password',
        };

        it('게시글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const postId = 1;
            const updatePostInput: UpdatePostInput = {
                title: '수정된 제목',
                content: '수정된 내용',
                authorId: 'user123',
                password: 'password',
            };

            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'user123',
                password: await bcrypt.hash('password', 10),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // 명시적으로 타입을 지정하여 모킹
            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);
            jest.spyOn(repository, 'update').mockResolvedValue({
                ...existingPost,
                title: updatePostInput.title || existingPost.title,
                content: updatePostInput.content || existingPost.content,
            } as Post);

            const result = await service.update(postId, updatePostInput);

            const updateData: Partial<Post> = {};
            if (updatePostInput.title !== undefined) {
                updateData.title = updatePostInput.title;
            }
            if (updatePostInput.content !== undefined) {
                updateData.content = updatePostInput.content;
            }

            expect(result).toEqual(
                expect.objectContaining({
                    title: updatePostInput.title,
                    content: updatePostInput.content,
                }),
            );
            expect(repository.update).toHaveBeenCalledWith(postId, updateData);
        });

        it('존재하지 않는 게시글 수정 시 NotFoundException을 던져야 한다.', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.update(postId, updatePostInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('different_password', 10);
            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'user123',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);

            await expect(service.update(postId, updatePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'different_user',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);

            await expect(service.update(postId, updatePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('delete', () => {
        const postId = 1;
        const deletePostInput: DeletePostInput = {
            authorId: 'user123',
            password: 'password',
        };

        it('게시글을 성공적으로 삭제할 수 있어야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'user123',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);
            jest.spyOn(repository, 'delete').mockResolvedValue(existingPost);

            const result = await service.delete(postId, deletePostInput);

            expect(result).toEqual(existingPost);
            expect(repository.delete).toHaveBeenCalledWith(postId);
        });

        it('존재하지 않는 게시글 삭제 시 NotFoundException을 던져야 한다.', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(postId, deletePostInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'different_user',
                password: 'hashedpassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);

            await expect(service.delete(postId, deletePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('different_password', 10);
            const existingPost: Post = {
                id: postId,
                title: '원본 제목',
                content: '원본 내용',
                authorId: 'user123',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingPost);

            await expect(service.delete(postId, deletePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });
});
