import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostCommentInput } from '../../comments/dtos/create-post-comment.input';
import { PostComment } from '@prisma/client';
import { PostCommentsRepository } from '../../comments/post-comment.repository';

describe('PostCommentsRepository', () => {
    let repository: PostCommentsRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostCommentsRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        postComment: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        repository = module.get<PostCommentsRepository>(PostCommentsRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('create', () => {
        it('새로운 댓글을 생성할 수 있어야 한다.', async () => {
            const createCommentInput: CreatePostCommentInput = {
                content: '테스트 댓글',
                authorId: 'user123',
                password: 'hashedpassword123',
                postId: 1,
            };

            const mockCreatedComment: PostComment = {
                id: 1,
                content: '테스트 댓글',
                authorId: 'user123',
                password: 'hashedpassword123',
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.postComment, 'create').mockResolvedValue(mockCreatedComment);

            const result = await repository.create({
                ...createCommentInput,
                password: createCommentInput.password,
            });

            expect(result).toEqual(mockCreatedComment);
            expect(prismaService.postComment.create).toHaveBeenCalledWith({
                data: {
                    content: createCommentInput.content,
                    authorId: createCommentInput.authorId,
                    password: createCommentInput.password,
                    postId: createCommentInput.postId,
                },
            });
        });

        it('게시글 ID가 없는 경우 댓글을 생성할 수 없어야 한다.', async () => {
            const createCommentInput: CreatePostCommentInput = {
                content: '테스트 댓글',
                authorId: 'user123',
                password: 'hashedpassword123',
                postId: 0, // 유효하지 않은 게시글 ID
            };

            jest.spyOn(prismaService.postComment, 'create').mockRejectedValue(
                new Error('Invalid postId'),
            );

            await expect(
                repository.create({
                    ...createCommentInput,
                    password: createCommentInput.password,
                }),
            ).rejects.toThrow('Invalid postId');
        });
    });

    describe('findByPostId', () => {
        it('특정 게시글의 모든 댓글을 조회할 수 있어야 한다.', async () => {
            const postId = 1;
            const mockComments: PostComment[] = [
                {
                    id: 1,
                    content: '테스트 댓글 1',
                    authorId: 'user123',
                    password: 'hashedpassword123',
                    postId: postId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    content: '테스트 댓글 2',
                    authorId: 'user456',
                    password: 'hashedpassword456',
                    postId: postId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(prismaService.postComment, 'findMany').mockResolvedValue(mockComments);

            const result = await repository.findByPostId(postId);
            expect(result).toEqual(mockComments);
            expect(prismaService.postComment.findMany).toHaveBeenCalledWith({
                where: { postId },
            });
        });
    });

    describe('update', () => {
        it('댓글을 성공적으로 수정할 수 있어야 한다.', async () => {
            const commentId = 1;
            const updateData = { content: '수정된 댓글 내용' };

            const mockUpdatedComment: PostComment = {
                id: commentId,
                content: '수정된 댓글 내용',
                authorId: 'user123',
                password: 'hashedpassword',
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.postComment, 'update').mockResolvedValue(mockUpdatedComment);

            const result = await repository.update(commentId, updateData);

            expect(result).toEqual(mockUpdatedComment);
            expect(prismaService.postComment.update).toHaveBeenCalledWith({
                where: { id: commentId },
                data: updateData,
            });
        });

        it('존재하지 않는 댓글 수정 시 예외가 발생해야 한다.', async () => {
            const commentId = 999;
            const updateData = { content: '수정된 댓글 내용' };

            jest.spyOn(prismaService.postComment, 'update').mockRejectedValue(
                new Error('Record not found'),
            );

            await expect(repository.update(commentId, updateData)).rejects.toThrow(
                'Record not found',
            );
        });
    });

    describe('delete', () => {
        it('특정 댓글을 성공적으로 삭제할 수 있어야 한다.', async () => {
            const commentId = 1;
            const mockDeletedComment: PostComment = {
                id: commentId,
                content: '삭제될 댓글',
                authorId: 'user123',
                password: 'hashedpassword',
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.postComment, 'delete').mockResolvedValue(mockDeletedComment);

            const result = await repository.delete(commentId);

            expect(result).toEqual(mockDeletedComment);
            expect(prismaService.postComment.delete).toHaveBeenCalledWith({
                where: { id: commentId },
            });
        });

        it('존재하지 않는 댓글 삭제 시 예외가 발생해야 한다.', async () => {
            const commentId = 999;

            jest.spyOn(prismaService.postComment, 'delete').mockRejectedValue(
                new Error('Record not found'),
            );

            await expect(repository.delete(commentId)).rejects.toThrow('Record not found');
        });
    });
});
