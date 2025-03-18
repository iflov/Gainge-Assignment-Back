import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from "./app.resolver";
import { GraphQLModule } from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
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
          plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true, includeCookies: true })],
      })
      // ORM 모듈 (별도 파일 생성 후 import 가능)
  ],
  controllers: [AppController],
  providers: [AppResolver, AppService],
})
export class AppModule {}
