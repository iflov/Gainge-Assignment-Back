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
                    provide: PostsRepository, // ✅ Mock Repository 등록
                    useValue: {
                        findAll: jest.fn(), // ✅ findAll()을 Mocking
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        repository = module.get<PostsRepository>(PostsRepository);
    });

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
});
