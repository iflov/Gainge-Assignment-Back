import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { AppModule } from '../../app.module';

describe('PostsResolver (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    // 테스트용 데이터
    const testAuthorId = 'e2e-test-user';
    const testPassword = 'test-password';
    let testPostId: number;

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
        await prismaService.post.deleteMany({
            where: { authorId: testAuthorId },
        });
    });

    afterAll(async () => {
        // 테스트 후 생성된 데이터 정리
        await prismaService.postComment.deleteMany({
            where: { authorId: testAuthorId },
        });
        await prismaService.post.deleteMany({
            where: { authorId: testAuthorId },
        });

        await app.close();
    });

    it('should create a new post', () => {
        const createPostMutation = `
      mutation {
        create_post(input: {
          title: "E2E Test Post",
          content: "This is a test post created during e2e testing",
          authorId: "${testAuthorId}",
          password: "${testPassword}"
        }) {
          id
          title
          content
          authorId
          createdAt
          updatedAt
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test') // GraphQL 엔드포인트
            .send({
                query: createPostMutation,
            })
            .expect(200)
            .expect((res) => {
                const post = res.body.data.create_post;
                expect(post.id).toBeDefined();
                expect(post.title).toBe('E2E Test Post');
                expect(post.content).toBe('This is a test post created during e2e testing');
                expect(post.authorId).toBe(testAuthorId);

                // 후속 테스트를 위해 ID 저장
                testPostId = post.id;
            });
    });

    it('should query all posts', () => {
        const postsQuery = `
      query {
        posts {
          id
          title
          authorId
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: postsQuery,
            })
            .expect(200)
            .expect((res) => {
                const posts = res.body.data.posts;
                expect(Array.isArray(posts)).toBe(true);
                // 최소한 우리가 생성한 포스트가 있어야 함
                expect(posts.length).toBeGreaterThan(0);
                // 생성한 포스트가 목록에 있는지 확인
                const createdPost = posts.find((p) => p.id === testPostId);
                expect(createdPost).toBeDefined();
                expect(createdPost.title).toBe('E2E Test Post');
            });
    });

    it('should query a specific post by id', () => {
        const postQuery = `
      query {
        post(id: ${testPostId}) {
          id
          title
          content
          authorId
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: postQuery,
            })
            .expect(200)
            .expect((res) => {
                const post = res.body.data.post;
                expect(post.id).toBe(testPostId);
                expect(post.title).toBe('E2E Test Post');
                expect(post.content).toBe('This is a test post created during e2e testing');
                expect(post.authorId).toBe(testAuthorId);
            });
    });

    it('should update a post', () => {
        const updatePostMutation = `
      mutation {
        updatePost(
          id: ${testPostId}, 
          input: {
            title: "Updated E2E Test Post",
            content: "This post was updated during e2e testing",
            authorId: "${testAuthorId}",
            password: "${testPassword}"
          }
        ) {
          id
          title
          content
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: updatePostMutation,
            })
            .expect(200)
            .expect((res) => {
                const post = res.body.data.updatePost;
                expect(post.id).toBe(testPostId);
                expect(post.title).toBe('Updated E2E Test Post');
                expect(post.content).toBe('This post was updated during e2e testing');
            });
    });

    it('should reject post update with wrong password', () => {
        const updatePostMutation = `
      mutation {
        updatePost(
          id: ${testPostId}, 
          input: {
            title: "This should fail",
            authorId: "${testAuthorId}",
            password: "wrong-password"
          }
        ) {
          id
          title
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: updatePostMutation,
            })
            .expect(200) // GraphQL은 에러가 있어도 200을 반환
            .expect((res) => {
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors[0].message).toContain('비밀번호가 일치하지 않습니다');
            });
    });

    it('should delete a post', () => {
        const deletePostMutation = `
      mutation {
        deletePost(
          id: ${testPostId}, 
          input: {
            authorId: "${testAuthorId}",
            password: "${testPassword}"
          }
        ) {
          id
          title
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: deletePostMutation,
            })
            .expect(200)
            .expect((res) => {
                const post = res.body.data.deletePost;
                expect(post.id).toBe(testPostId);
            });
    });

    it('should confirm post deletion', () => {
        const postQuery = `
      query {
        post(id: ${testPostId}) {
          id
        }
      }
    `;

        return request(app.getHttpServer())
            .post('/test')
            .send({
                query: postQuery,
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors.length).toBeGreaterThan(0);
            });
    });
});
