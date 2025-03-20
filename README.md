# 게시글 및 댓글 관리 API (NestJS + GraphQL)

## 기술 스택

- **언어 및 런타임**: TypeScript, Node.js
- **프레임워크**: NestJS
- **API 타입**: GraphQL (Code-First 방식)
- **ORM**: Prisma
- **데이터베이스**: MySQL
- **보안**: bcrypt (비밀번호 해싱)
- **테스트**: Jest

## 프로젝트 구조

```
├── prisma/                # Prisma 스키마 및 마이그레이션 파일
├── src/
│   ├── __test__/          # 테스트 파일
│   ├── comments/          # 댓글 관련 모듈
│   ├── common/            # 공통 유틸리티, 필터 등
│   ├── posts/             # 게시글 관련 모듈
│   ├── prisma/            # Prisma 서비스 모듈
│   ├── app.controller.ts  # 앱 컨트롤러
│   ├── app.module.ts      # 메인 앱 모듈
│   ├── app.resolver.ts    # 앱 리졸버
│   ├── app.service.ts     # 앱 서비스
│   └── main.ts            # 애플리케이션 진입점

```

## 설치 및 실행 방법

### 사전 준비 사항

- Node.js (v14 이상)
- Docker (DB 실행용)

### 설치

```bash
# 레포지토리 클론
git clone git@github.com:iflov/Gainge-Assignment-Back.git
cd [프로젝트 폴더]

# 의존성 설치
npm install
```

### 데이터베이스 설정

```bash
# Docker를 이용한 MySQL 실행
npm run docker:up
```

### 마이그레이션 실행

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev
```

### 서버 실행

```bash
# 개발 서버 실행
npm run start

# 또는 프로덕션 빌드 후 실행
npm run build
npm run start:prod
```

서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.
GraphQL Playground는 `http://localhost:5000/test`에서 접근 가능합니다.

## API 문서

### 게시글 API

#### 게시글 목록 조회

```graphql
query {
  posts {
    id
    title
    content
    authorId
    createdAt
    updatedAt
  }
}
```

#### 특정 게시글 조회

```graphql
query {
  post(id: 1) {
    id
    title
    content
    authorId
    createdAt
    updatedAt
  }
}
```

#### 게시글 생성

```graphql
mutation {
  create_post(input: {
    title: "제목입니다"
    content: "내용입니다"
    authorId: "user123"
    password: "password123"
  }) {
    id
    title
    content
    authorId
    createdAt
  }
}
```

#### 게시글 수정

```graphql
mutation {
  update_post(
    id: 1, 
    input: {
      title: "수정된 제목"
      content: "수정된 내용"
      authorId: "user123"
      password: "password123"
    }
  ) {
    id
    title
    content
    updatedAt
  }
}
```

#### 게시글 삭제

```graphql
mutation {
  delete_post(
    id: 1, 
    input: {
      authorId: "user123"
      password: "password123"
    }
  ) {
    id
    title
  }
}
```

### 댓글 API

#### 특정 게시글의 댓글 조회

```graphql
query {
  post_comments(postId: 1) {
    id
    content
    authorId
    createdAt
    post {
      id
      title
    }
  }
}
```

#### 댓글 생성

```graphql
mutation {
  create_post_comment(input: {
    content: "댓글 내용입니다"
    authorId: "user123"
    password: "password123"
    postId: 1
  }) {
    id
    content
    authorId
    createdAt
    post {
      id
      title
    }
  }
}
```

#### 댓글 수정

```graphql
mutation {
  update_post_comment(
    id: 1, 
    input: {
      content: "수정된 댓글 내용"
      authorId: "user123"
      password: "password123"
      postId: 1
    }
  ) {
    id
    content
    updatedAt
  }
}
```

#### 댓글 삭제

```graphql
mutation {
    delete_post_comment(
        id: 1,
        input: {
            authorId: "user123"
            password: "password123"
        }
    ) {
        id
        content
    }
}
```

## 테스트 실행

```bash
# 유닛 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:cov
```

## 구현 세부사항

### 데이터 모델링
- Prisma 스키마를 이용한 DB 스키마 설계
- `Post`와 `PostComment` 엔티티 간 1:N 관계 구현
- 각 엔티티에 인덱스 설정으로 쿼리 성능 최적화
- DB 마이그레이션 파일을 통한 스키마 버전 관리

### 비즈니스 로직
- 게시글/댓글 작성 시 작성자 ID와 비밀번호 저장
- 수정/삭제 작업 시 작성자 ID와 비밀번호 검증
- bcrypt를 이용한 비밀번호 해싱으로 보안 강화
- 엄격한 입력값 검증 및 예외 처리

### 아키텍처
- Repository 패턴을 통한 데이터 액세스 로직 분리
- 인터페이스를 활용한 의존성 역전 원칙(DIP) 구현
- 모듈화된 NestJS 아키텍처로 코드 유지보수성 향상
- GraphQL 예외 필터를 통한 일관된 에러 처리

### 기술 선택 가이드
- [프로젝트 기술 선택 가이드](docs/EXPLAIN.md)