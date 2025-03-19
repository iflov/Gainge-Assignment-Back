import { Test, TestingModule } from '@nestjs/testing';
import { CommentsResolver } from '../../comments/comments.resolver';
import { CommentsService } from '../../comments/comments.service';
import { CreatePostCommentInput } from '../../comments/dtos/create-post-comment.input';
import { PostComment } from '../../comments/entities/post-comment.model';
import { Post } from '../../posts/entities/posts.model';

describe('CommentsResolver', () => {
    let resolver: CommentsResolver;
    let service: CommentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsResolver,
                {
                    provide: CommentsService,
                    useValue: {
                        create: jest.fn(),
                        findByPostId: jest.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<CommentsResolver>(CommentsResolver);
        service = module.get<CommentsService>(CommentsService);
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

            const result = await resolver.postComments(postId);
            expect(result).toEqual(mockComments);
            expect(service.findByPostId).toHaveBeenCalledWith(postId);
        });
    });
});
