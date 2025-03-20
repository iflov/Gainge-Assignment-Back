# 베이스 이미지로 Node.js 18 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# MySQL 클라이언트 설치
RUN apt-get update && apt-get install -y default-mysql-client

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 파일 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 애플리케이션 빌드
RUN npm run build

# 포트 노출
EXPOSE 5000

# 마이그레이션 실행 후 앱 시작
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]