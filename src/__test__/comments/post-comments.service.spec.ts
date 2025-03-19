import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../../comments/comments.service';
import { IPostsRepository } from '../../posts/interfaces/posts-repository.interface';
import { PostComment } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreatePostCommentInput } from '../../comments/dtos/create-post-comment.input';
import { IPostCommentsRepository } from '../../comments/interfaces/posts-comment-repository.interface';
import { Post } from '../../posts/entities/posts.model';
import { PostComment as GraphQLPostComment } from '../../comments/entities/post-comment.model';

describe('CommentsService', () => {
    let service: CommentsService;
    let commentsRepository: IPostCommentsRepository;
    let postsRepository: IPostsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: 'IPostCommentsRepository',
                    useValue: {
                        create: jest.fn(),
                        findByPostId: jest.fn(),
                        findOne: jest.fn(),
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

        service = module.get<CommentsService>(CommentsService);
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
});
