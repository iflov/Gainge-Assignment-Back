# 베이스 이미지로 Node.js 18 Alpine 버전 사용 (가벼운 이미지 크기를 위해)
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# wait-for-it.sh 스크립트 설치를 위한 bash 및 mysql-client 설치
RUN apk add --no-cache bash mysql-client

# wait-for-it.sh 스크립트 추가
COPY wait-for-it.sh ./
RUN chmod +x ./wait-for-it.sh

# package.json과 package-lock.json 복사 (캐싱 최적화를 위해)
COPY package*.json ./

# npm ci 명령어로 정확한 버전의 의존성 설치 (package-lock.json 기준)
RUN npm ci

# 소스 파일 복사
COPY . .

# Prisma 클라이언트 생성 (DB 스키마 기반으로 타입 안전한 쿼리 빌더 생성)
RUN npx prisma generate

# 애플리케이션 빌드 (TypeScript를 JavaScript로 컴파일)
RUN npm run build

# 과제 요구사항에 맞춘 포트 노출 (5000)
EXPOSE 5000

# MariaDB 대기 후 앱 실행 (개발 모드로 설정)
CMD ["./wait-for-it.sh", "mysql-db:3306", "--", "npm", "run", "start"]