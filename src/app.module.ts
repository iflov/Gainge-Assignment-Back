import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        // Config 모듈
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        // GraphQL 모듈
        GraphQLModule.forRoot<ApolloDriverConfig>({
            path: 'test',
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: false,
            cache: 'bounded',
            // 전역 Reslover에서 Context 객체 사용
            context: ({ req, res }) => {
                return { req, res };
            },
            plugins: [
                ApolloServerPluginLandingPageLocalDefault({ embed: true, includeCookies: true }),
            ],
        }),

        PostsModule,
        CommentsModule,
        // ORM 모듈 (별도 파일 생성 후 import 가능)
        PrismaModule,
    ],
    controllers: [AppController],
    providers: [AppResolver, AppService],
})
export class AppModule {}
