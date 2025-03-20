import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentsService } from '../../comments/post-comments.service';
import { IPostsRepository } from '../../posts/interfaces/posts-repository.interface';
import { PostComment } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreatePostCommentInput } from '../../comments/dtos/create-post-comment.input';
import { IPostCommentsRepository } from '../../comments/interfaces/posts-comment-repository.interface';
import { Post } from '../../posts/entities/posts.model';
import { PostComment as GraphQLPostComment } from '../../comments/entities/post-comment.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePostCommentInput } from '../../comments/dtos/update-post-comment.input';
import { DeletePostCommentInput } from '../../comments/dtos/delete-post-comment.input';

describe('CommentsService', () => {
    let service: PostCommentsService;
    let commentsRepository: IPostCommentsRepository;
    let postsRepository: IPostsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostCommentsService,
                {
                    provide: 'IPostCommentsRepository',
                    useValue: {
                        create: jest.fn(),
                        findByPostId: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: 'IPostsRepository',
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostCommentsService>(PostCommentsService);
        commentsRepository = module.get<IPostCommentsRepository>('IPostCommentsRepository');
        postsRepository = module.get<IPostsRepository>('IPostsRepository');
    });

    describe('create', () => {
        it('새로운 댓글을 생성할 수 있어야 한다.', async () => {
            const createCommentInput: CreatePostCommentInput = {
                content: '테스트 댓글',
                authorId: 'user123',
                password: 'password',
                postId: 1,
            };

            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'testPassword', // 추가
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockCreatedComment: PostComment = {
                id: 1,
                content: '테스트 댓글',
                authorId: 'user123',
                password: await bcrypt.hash('password', 10),
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const expectedResult: GraphQLPostComment = {
                ...mockCreatedComment,
                post: mockPost,
            };

            jest.spyOn(postsRepository, 'findOne').mockResolvedValue(mockPost);
            jest.spyOn(commentsRepository, 'create').mockResolvedValue(mockCreatedComment);

            const result = await service.create(createCommentInput);

            expect(result).toEqual(expectedResult);
            expect(postsRepository.findOne).toHaveBeenCalledWith(createCommentInput.postId);
            expect(commentsRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: createCommentInput.content,
                    authorId: createCommentInput.authorId,
                }),
            );
        });

        // 나머지 테스트 코드는 동일
    });

    describe('findByPostId', () => {
        it('특정 게시글의 모든 댓글을 조회할 수 있어야 한다.', async () => {
            const postId = 1;
            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'testPassword', // 추가
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockComments: PostComment[] = [
                {
                    id: 1,
                    content: '테스트 댓글 1',
                    authorId: 'user123',
                    password: 'hashedpassword',
                    postId: postId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const expectedResult: GraphQLPostComment[] = mockComments.map((comment) => ({
                ...comment,
                post: mockPost,
            }));

            jest.spyOn(postsRepository, 'findOne').mockResolvedValue(mockPost);
            jest.spyOn(commentsRepository, 'findByPostId').mockResolvedValue(mockComments);

            const result = await service.findByPostId(postId);

            expect(result).toEqual(expectedResult);
            expect(postsRepository.findOne).toHaveBeenCalledWith(postId);
            expect(commentsRepository.findByPostId).toHaveBeenCalledWith(postId);
        });

        // 나머지 테스트 코드는 동일
    });

    describe('update', () => {
        const commentId = 1;
        const updateCommentInput: UpdatePostCommentInput = {
            content: '수정된 댓글',
            authorId: 'user123',
            password: 'password',
            postId: 1,
        };

        it('댓글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'postPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'user123',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUpdatedComment: PostComment = {
                ...existingComment,
                content: '수정된 댓글',
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);
            jest.spyOn(postsRepository, 'findOne').mockResolvedValue(mockPost);
            jest.spyOn(commentsRepository, 'update').mockResolvedValue(mockUpdatedComment);

            const result = await service.update(commentId, updateCommentInput);

            expect(result).toEqual(
                expect.objectContaining({
                    id: commentId,
                    content: '수정된 댓글',
                    post: mockPost,
                }),
            );
            expect(commentsRepository.findOne).toHaveBeenCalledWith(commentId);
            expect(commentsRepository.update).toHaveBeenCalledWith(commentId, {
                content: updateCommentInput.content,
            });
        });

        it('존재하지 않는 댓글 수정 시 NotFoundException을 던져야 한다.', async () => {
            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(null);

            await expect(service.update(commentId, updateCommentInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'different_user',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);

            await expect(service.update(commentId, updateCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('different_password', 10);
            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'user123',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);

            await expect(service.update(commentId, updateCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('delete', () => {
        const commentId = 1;
        const deleteCommentInput: DeletePostCommentInput = {
            authorId: 'user123',
            password: 'password',
        };

        it('댓글을 성공적으로 삭제할 수 있어야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'postPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'user123',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockDeletedComment: PostComment = {
                ...existingComment,
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);
            jest.spyOn(postsRepository, 'findOne').mockResolvedValue(mockPost);
            jest.spyOn(commentsRepository, 'delete').mockResolvedValue(mockDeletedComment);

            const result = await service.delete(commentId, deleteCommentInput);

            expect(result).toEqual(
                expect.objectContaining({
                    id: commentId,
                    post: mockPost,
                }),
            );
            expect(commentsRepository.findOne).toHaveBeenCalledWith(commentId);
            expect(commentsRepository.delete).toHaveBeenCalledWith(commentId);
        });

        it('존재하지 않는 댓글 삭제 시 NotFoundException을 던져야 한다.', async () => {
            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(commentId, deleteCommentInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);
            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'different_user',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);

            await expect(service.delete(commentId, deleteCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const hashedPassword = await bcrypt.hash('different_password', 10);
            const existingComment: PostComment = {
                id: commentId,
                content: '원본 댓글',
                authorId: 'user123',
                password: hashedPassword,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(commentsRepository, 'findOne').mockResolvedValue(existingComment);

            await expect(service.delete(commentId, deleteCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });
});
