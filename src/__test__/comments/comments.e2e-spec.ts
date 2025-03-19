import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { AppModule } from '../../app.module';
import * as bcrypt from 'bcrypt';

describe('CommentsResolver (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    // 테스트용 데이터
    const testAuthorId = 'e2e-comment-user';
    const testPassword = 'comment-password';
    let testPostId: number;
    let testCommentId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        // 테스트 전 기존 테스트 데이터 정리
        await prismaService.postComment.deleteMany({
            where: { authorId: testAuthorId },
        });

        // 테스트용 게시글 생성
        // 테스트용 게시글 생성
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const createdPost = await prismaService.post.create({
            data: {
                title: 'Test Post for Comments',
                content: 'Content for testing comments',
                authorId: testAuthorId,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        testPostId = createdPost.id;
    });

    afterAll(async () => {
        // 테스트 후 생성된 데이터 정리
        await prismaService.postComment.deleteMany({
            where: { postId: testPostId },
        });
        await prismaService.post.deleteMany({
            where: { id: testPostId },
        });

        await app.close();
    });

    it('should create a new comment', () => {
        const createCommentMutation = `
      mutation {
        create_post_comment(input: {
          content: "This is a test comment",
          authorId: "${testAuthorId}",
          password: "${testPassword}",
          postId: ${testPostId}
        }) {
          id
          content
          authorId
          postId
          createdAt
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: createCommentMutation,
            })
            .expect(200)
            .expect((res) => {
                const comment = res.body.data.create_post_comment;
                expect(comment.id).toBeDefined();
                expect(comment.content).toBe('This is a test comment');
                expect(comment.authorId).toBe(testAuthorId);
                expect(comment.postId).toBe(testPostId);

                // 후속 테스트를 위해 ID 저장
                testCommentId = comment.id;
            });
    });

    it('should query all comments for a post', () => {
        const commentsQuery = `
      query {
        postComments(postId: ${testPostId}) {
          id
          content
          authorId
          postId
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: commentsQuery,
            })
            .expect(200)
            .expect((res) => {
                const comments = res.body.data.postComments;
                expect(Array.isArray(comments)).toBe(true);
                expect(comments.length).toBeGreaterThan(0);

                const createdComment = comments.find((c) => c.id === testCommentId);
                expect(createdComment).toBeDefined();
                expect(createdComment.content).toBe('This is a test comment');
                expect(createdComment.postId).toBe(testPostId);
            });
    });

    it('should update a comment', () => {
        const updateCommentMutation = `
      mutation {
        updatePostComment(
          id: ${testCommentId}, 
          input: {
            content: "This comment was updated",
            authorId: "${testAuthorId}",
            password: "${testPassword}",
            postId: ${testPostId}
          }
        ) {
          id
          content
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: updateCommentMutation,
            })
            .expect(200)
            .expect((res) => {
                const comment = res.body.data.updatePostComment;
                expect(comment.id).toBe(testCommentId);
                expect(comment.content).toBe('This comment was updated');
            });
    });

    it('should reject comment update with wrong password', () => {
        const updateCommentMutation = `
      mutation {
        updatePostComment(
          id: ${testCommentId}, 
          input: {
            content: "This should fail",
            authorId: "${testAuthorId}",
            password: "wrong-password",
            postId: ${testPostId}
          }
        ) {
          id
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: updateCommentMutation,
            })
            .expect(200) // GraphQL은 에러가 있어도 200을 반환
            .expect((res) => {
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors[0].message).toContain('비밀번호가 일치하지 않습니다');
            });
    });

    it('should delete a comment', () => {
        const deleteCommentMutation = `
      mutation {
        deletePostComment(
          id: ${testCommentId}, 
          input: {
            authorId: "${testAuthorId}",
            password: "${testPassword}"
          }
        ) {
          id
          content
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: deleteCommentMutation,
            })
            .expect(200)
            .expect((res) => {
                const comment = res.body.data.deletePostComment;
                expect(comment.id).toBe(testCommentId);
            });
    });

    it('should confirm comment deletion by querying comments', () => {
        const commentsQuery = `
      query {
        postComments(postId: ${testPostId}) {
          id
          content
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: commentsQuery,
            })
            .expect(200)
            .expect((res) => {
                const comments = res.body.data.postComments;
                const deletedComment = comments.find((c) => c.id === testCommentId);
                expect(deletedComment).toBeUndefined();
            });
    });
});
