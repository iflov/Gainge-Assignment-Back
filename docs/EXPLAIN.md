# 프로젝트 아키텍처 및 기술 선택 가이드

## Code-First 접근 방식 선택 이유

이 프로젝트에서는 Schema-First가 아닌 Code-First 접근 방식을 선택했습니다. 주요 선택 이유는 다음과 같습니다:

1. **백엔드에서 담당하는 GraphQL**: 백엔드에서 GraphQL을 담당할 경우 유지보수에 유리한 Code-First가 옳다고 판단하여 적용
2. **DTO 사용에 유리**: NestJS의 강력한 데코레이터 기능을 사용해 검증 규칙(class-validator)을 쉽게 적용가능하므로 DTO사용에 유리하다고 판단
3. **일관성 유지**: TypeScript를 사용하는 NestJS 환경에서 GraphQL 스키마와 백엔드 코드 간의 일관성을 유지하는 데 유리
## Prisma ORM 선택 이유

Prisma ORM을 선택한 주요 이유는 다음과 같습니다:

1. **타입 안전성**: Prisma Client는 스키마에서 자동 생성된 타입을 제공하여 타입 안전성 확보
2. **직관적인 API**: 복잡한 쿼리도 직관적인 API로 작성 가능
3. **마이그레이션 관리**: 스키마 변경 사항을 자동으로 추적하고 마이그레이션 파일 생성
4. **성능 최적화**: 효율적인 쿼리 생성 및 N+1 문제 해결을 위한 관계 데이터 로딩 최적화
5. **스키마 정의 용이성**: Prisma 스키마 언어(PSL)를 통해 직관적이고 명확한 데이터 모델 정의
6. **풍부한 개발자 경험**: 강력한 CLI 도구, 자동완성, 타입 추론 지원

## IRepository 패턴 적용 이유

이 프로젝트에서는 인터페이스를 통한 Repository 패턴을 적용했습니다:

```typescript
// interfaces/posts-repository.interface.ts
export interface IPostsRepository {
    findAll(): Promise<Post[]>;
    create(data: CreatePostInput & { password: string }): Promise<Post>;
    findOne(postId: number): Promise<Post | null>;
    update(id: number, data: Partial<Pick<Post, 'title' | 'content'>>): Promise<Post>;
    delete(id: number): Promise<Post>;
}
```

이 패턴을 적용한 주요 이유는 다음과 같습니다:

1. **의존성 역전 원칙(DIP) 적용**: 서비스 계층이 구체적인 구현체가 아닌 인터페이스에 의존하도록 함
2. **테스트 용이성**: 단위 테스트 시 실제 데이터베이스 연결 없이 모킹 가능
3. **관심사 분리**: 데이터 접근 로직을 비즈니스 로직으로부터 분리
4. **코드 재사용**: 공통 데이터 액세스 패턴을 인터페이스로 표준화하여 일관성 확보
5. **유지보수성 향상**: 데이터 소스 변경 시 서비스 계층 코드 수정 없이 리포지토리 구현체만 교체 가능
6. **트랜잭션 관리 용이**: 리포지토리 계층에서 데이터베이스 트랜잭션을 일관되게 관리 가능

이 아키텍처 결정은 특히 대규모 애플리케이션으로의 확장성과 장기적인 유지보수를 고려했을 때 중요한 이점을 제공합니다.