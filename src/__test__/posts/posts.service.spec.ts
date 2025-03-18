import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../posts/posts.service';
import { PostsRepository } from '../../posts/posts.repository';

describe('PostsService', () => {
    let service: PostsService;
    let repository: PostsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: PostsRepository, // Mock Repository 등록
                    useValue: {
                        findAll: jest.fn(), // findAll()을 Mocking
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        repository = module.get<PostsRepository>(PostsRepository);
    });

    describe('findAll 유닛 테스트', () => {
        it('서비스가 정상적으로 정의됨', () => {
            expect(service).toBeDefined();
        });

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

        it('게시글이 없을 때 빈 배열을 반환해야 한다', async () => {
            const emptyPosts = [];
            jest.spyOn(repository, 'findAll').mockResolvedValue(emptyPosts);

            const result = await service.findAll();
            expect(result).toEqual([]);
            expect(result.length).toBe(0);
        });

        it('findAll 메서드 호출 실패 시 예외를 처리해야 한다', async () => {
            jest.spyOn(repository, 'findAll').mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow('Database error');
        });
    });
});
