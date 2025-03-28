import { Test, TestingModule } from '@nestjs/testing';
import { PostsResolver } from '../../posts/posts.resolver';
import { PostsService } from '../../posts/posts.service';
import { CreatePostInput } from '../../posts/dtos/create-post.input';
import { Post } from '../../posts/entities/posts.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePostInput } from '../../posts/dtos/update-post.input';
import { DeletePostInput } from '../../posts/dtos/delete-post.input';

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
                        update: jest.fn(),
                        delete: jest.fn(),
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

    describe('updatePost', () => {
        it('게시글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const postId = 1;
            const updatePostInput: UpdatePostInput = {
                title: '수정된 제목',
                content: '수정된 내용',
                authorId: 'user123',
                password: 'password',
            };

            const mockUpdatedPost: Post = {
                id: postId,
                title: '수정된 제목', // 명시적으로 문자열 지정
                content: '수정된 내용', // 명시적으로 문자열 지정
                authorId: updatePostInput.authorId,
                password: updatePostInput.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedPost);

            const result = await resolver.updatePost(postId, updatePostInput);

            expect(result).toEqual(mockUpdatedPost);
            expect(service.update).toHaveBeenCalledWith(postId, updatePostInput);
        });
    });

    describe('deletePost', () => {
        it('게시글을 성공적으로 삭제할 수 있어야 한다.', async () => {
            const postId = 1;
            const deletePostInput: DeletePostInput = {
                authorId: 'user123',
                password: 'password',
            };

            const mockDeletedPost: Post = {
                id: postId,
                title: 'Test Post',
                content: 'Hello',
                authorId: 'user123',
                password: 'hashedpassword123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'delete').mockResolvedValue(mockDeletedPost);

            const result = await resolver.deletePost(postId, deletePostInput);
            expect(result).toEqual(mockDeletedPost);
            expect(service.delete).toHaveBeenCalledWith(postId, deletePostInput);
        });

        it('존재하지 않는 게시글 삭제 시 NotFoundException을 던져야 한다.', async () => {
            const postId = 999;
            const deletePostInput: DeletePostInput = {
                authorId: 'user123',
                password: 'password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new NotFoundException('해당 게시글을 찾을 수 없습니다.'),
            );

            await expect(resolver.deletePost(postId, deletePostInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const postId = 1;
            const deletePostInput: DeletePostInput = {
                authorId: 'wrong_user',
                password: 'password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new BadRequestException('게시글 작성자만 삭제할 수 있습니다.'),
            );

            await expect(resolver.deletePost(postId, deletePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const postId = 1;
            const deletePostInput: DeletePostInput = {
                authorId: 'user123',
                password: 'wrong_password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new BadRequestException('비밀번호가 일치하지 않습니다.'),
            );

            await expect(resolver.deletePost(postId, deletePostInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });
});
