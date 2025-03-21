import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentsResolver } from '../../comments/post-comments.resolver';
import { PostCommentsService } from '../../comments/post-comments.service';
import { CreatePostCommentInput } from '../../comments/dtos/create-post-comment.input';
import { PostComment } from '../../comments/entities/post-comment.model';
import { Post } from '../../posts/entities/posts.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePostCommentInput } from '../../comments/dtos/update-post-comment.input';
import { DeletePostCommentInput } from '../../comments/dtos/delete-post-comment.input';

describe('CommentsResolver', () => {
    let resolver: PostCommentsResolver;
    let service: PostCommentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostCommentsResolver,
                {
                    provide: PostCommentsService,
                    useValue: {
                        create: jest.fn(),
                        findByPostId: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<PostCommentsResolver>(PostCommentsResolver);
        service = module.get<PostCommentsService>(PostCommentsService);
    });

    describe('createPostComment', () => {
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
                password: 'testPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockCreatedComment: PostComment = {
                id: 1,
                content: '테스트 댓글',
                authorId: 'user123',
                password: 'hashedpassword',
                postId: 1,
                post: mockPost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockCreatedComment);

            const result = await resolver.createPostComment(createCommentInput);
            expect(result).toEqual(mockCreatedComment);
            expect(service.create).toHaveBeenCalledWith(createCommentInput);
        });
    });

    describe('postComments', () => {
        it('특정 게시글의 모든 댓글을 조회할 수 있어야 한다.', async () => {
            const postId = 1;
            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'testPassword',
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
                    post: mockPost,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(service, 'findByPostId').mockResolvedValue(mockComments);

            const result = await resolver.getPostComments(postId);
            expect(result).toEqual(mockComments);
            expect(service.findByPostId).toHaveBeenCalledWith(postId);
        });
    });

    describe('update_post_comment', () => {
        it('댓글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const commentId = 1;
            const updateCommentInput: UpdatePostCommentInput = {
                content: '수정된 댓글',
                authorId: 'user123',
                password: 'password',
                postId: 1,
            };

            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'testPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUpdatedComment: PostComment = {
                id: commentId,
                content: '수정된 댓글',
                authorId: 'user123',
                password: 'hashedpassword',
                postId: 1,
                post: mockPost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedComment);

            const result = await resolver.updatePostComment(commentId, updateCommentInput);

            expect(result).toEqual(mockUpdatedComment);
            expect(service.update).toHaveBeenCalledWith(commentId, updateCommentInput);
        });

        it('존재하지 않는 댓글 수정 시 NotFoundException을 던져야 한다.', async () => {
            const commentId = 999;
            const updateCommentInput: UpdatePostCommentInput = {
                content: '수정된 댓글',
                authorId: 'user123',
                password: 'password',
                postId: 1,
            };

            jest.spyOn(service, 'update').mockRejectedValue(
                new NotFoundException('해당 댓글을 찾을 수 없습니다.'),
            );

            await expect(resolver.updatePostComment(commentId, updateCommentInput)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('delete_post_comment', () => {
        it('댓글을 성공적으로 삭제할 수 있어야 한다.', async () => {
            const commentId = 1;
            const deleteCommentInput: DeletePostCommentInput = {
                authorId: 'user123',
                password: 'password',
            };

            const mockPost: Post = {
                id: 1,
                title: '테스트 게시글',
                content: '게시글 내용',
                authorId: 'postAuthor',
                password: 'testPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockDeletedComment: PostComment = {
                id: commentId,
                content: '삭제될 댓글',
                authorId: 'user123',
                password: 'hashedpassword',
                postId: 1,
                post: mockPost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'delete').mockResolvedValue(mockDeletedComment);

            const result = await resolver.deletePostComment(commentId, deleteCommentInput);

            expect(result).toEqual(mockDeletedComment);
            expect(service.delete).toHaveBeenCalledWith(commentId, deleteCommentInput);
        });

        it('존재하지 않는 댓글 삭제 시 NotFoundException을 던져야 한다.', async () => {
            const commentId = 999;
            const deleteCommentInput: DeletePostCommentInput = {
                authorId: 'user123',
                password: 'password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new NotFoundException('해당 댓글을 찾을 수 없습니다.'),
            );

            await expect(resolver.deletePostComment(commentId, deleteCommentInput)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('작성자 ID가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const commentId = 1;
            const deleteCommentInput: DeletePostCommentInput = {
                authorId: 'wrong_user',
                password: 'password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new BadRequestException('댓글 작성자만 삭제할 수 있습니다.'),
            );

            await expect(resolver.deletePostComment(commentId, deleteCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('비밀번호가 일치하지 않으면 BadRequestException을 던져야 한다.', async () => {
            const commentId = 1;
            const deleteCommentInput: DeletePostCommentInput = {
                authorId: 'user123',
                password: 'wrong_password',
            };

            jest.spyOn(service, 'delete').mockRejectedValue(
                new BadRequestException('비밀번호가 일치하지 않습니다.'),
            );

            await expect(resolver.deletePostComment(commentId, deleteCommentInput)).rejects.toThrow(
                BadRequestException,
            );
        });
    });
});
