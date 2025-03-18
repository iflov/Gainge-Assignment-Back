# Gainge-Assignment-Back
가인지캠퍼스 백엔드 개발자 과제

## 📝 목적
- 채용 및 인턴 평가용 백엔드 개발 과제
- 지원자는 주어진 요구 사항에 맞춰 데이터 모델링을 설계하고, 이를 기반으로 GraphQL API를 NestJS로 구현

## 🎯 요구사항
1. **데이터 모델링**
    - 주어진 요구 사항을 기반으로 **관계형 데이터베이스 스키마**를 설계
    - DDL을 작성하거나, 마이그레이션 파일을 포함하여 공유
2. **ORM 설정**
   - TypeORM 또는 Prisma 중 선택하여 ORM을 사용
   - 가급적 Repository 패턴을 사용하여 데이터 접근 (**Raw Query 사용 지양**)
3. **GraphQL API 구현 (NestJS)**
    - 설계한 데이터 모델을 활용하여 GraphQL API를 NestJS로 개발
    - 다음 기능을 포함
        - 엔티티 목록 조회 (`Query`)
        - 특정 엔티티 상세 조회 (`Query`)
        - 새로운 엔티티 생성 (`Mutation`)
        - 특정 엔티티 수정 (`Mutation`)
        - 특정 엔티티 삭제 (`Mutation`)
4. **코드 구조**
    - NestJS의 **모듈화된 아키텍처**
    - **Repository 패턴**을 사용하여 데이터 접근 로직을 분리
5. **(선택) 테스트**
    - 간단한 **유닛 테스트** 또는 **e2e 테스트**를 작성하면 가산점

## 📌 상세 요구 사항
- **기술 스택**
    - API 유형 : **GraphQL** (Code-First 또는 Schema-First 방식 선택 가능)
    - ORM: TypeORM 또는 Prisma 중 선택
    - DB : MySQL 또는 PostgreSQL 중 선택
    - 빌드 : Nest 빌드 혹은 Docker 이미지 빌드 중 선택
      - Docker 이미지는 공개된 개인 레포지토리에 업로드
    - (선택) 테스트 : Jest 사용
- **필수 API**
    - `Post` 엔티티 (게시글)
        - `posts`: 전체 게시글 목록 조회
        - `post(id: PostId!)`: 특정 게시글 조회
        - `create_post(input: CreatePostInput!)`: 게시글 생성

          > CreatePostInput 필수 요소
          >  - 작성자 ID
          >  - 작성자 비밀번호
          >  - 게시글 제목
    
        - `update_post(id: PostId!, input: UpdatePostInput!)`: 게시글 정보 수정
        - `delete_post(id: PostId!)`: 게시글 삭제
        - ⭐ 게시글 정보 수정 및 삭제 시 작성자 ID와 비밀번호 확인 필수
- **(선택) 추가 API**
    - `PostComment` 엔티티 (게시글 댓글)
        - `post_comments(id: PostId!)`: 특정 게시글의 전체 댓글 목록 조회
        - `create_post_comment(input: CreatePostCommentInput!)`: 게시글 댓글 생성

          > CreatePostCommentInput 필수 요소
          >  - 작성자 ID
          >  - 작성자 비밀번호
    
        - `update_post_comment(id: PostCommentId!, input: UpdatePostCommentInput!)`: 게시글 댓글 정보 수정
        - `delete_post_comment(id: PostCommentId!)`: 게시글 댓글 삭제
        - ⭐️ 게시글 댓글 정보 수정 및 삭제 시 작성자 ID와 비밀번호 확인 필수
- **제출 방식**
    - GitHub 레포지토리에 코드를 업로드 후, 해당 링크를 공유
    - (선택) `README.md`에 실행 방법 및 API 문서를 작성하면 가산점
    - (선택) 테스트 코드 작성 시 \__test\__ 폴더에 생성

## 🔧 기본 설정
- NestJS (express 래핑)
- TypeScript (V4.7 이상)
- 서버 포트 번호 5000
- DB 실행 시 docker compose 사용
  ```bash
  # docker compose 실행
  npm run docker:up
  # 컨테이너 중단 및 이미지 제거
  npm run docker:down
  ```
- 🗃️ DB 접속 정보
  - **MySQL 기본 사용자**는 'root', 비밀번호는 'test'
  - **PostgreSQL 기본 사용자**는 'postgres', 비밀번호는 'test'

## 🧪 API 테스트
  - ▶️ **서버 실행**
    ```bash 
    npm run start
    ```
  - 서버 실행 후 브라우저에서 `http://localhost:5000/test` 접속
  - 포트 번호와 호스트 주소를 변경할 경우 해당 값에 맞춰서 접속

## ✅ 평가 기준
- ❗️ 요청한 제한 시간 내 제출
- 데이터 모델링의 적절성
  - 마이그레이션 파일 생성
  - PK 및 인덱스 설정
  - 데이터베이스 정규화
- ORM 사용의 적절성
    - Repository 패턴 사용
    - Raw Query 사용 지양
- NestJS의 아키텍처 활용
    - Model - Controller - Service 패턴
    - DTO 사용
- GraphQL API의 적절한 설계 및 구현
    - 게시글 CRUD
    - 게시글 댓글 CRUD
- 코드의 가독성 및 유지보수성
    - ESLint 적용
    - Prettier 적용
    - README 작성
- 에러 핸들링 및 예외 처리
