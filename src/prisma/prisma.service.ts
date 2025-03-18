import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    // NestJS 모듈 초기화 시 Prisma 클라이언트 연결
    async onModuleInit() {
        await this.$connect();
    }

    // NestJS 모듈 종료 시 Prisma 클라이언트 연결 해제
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
