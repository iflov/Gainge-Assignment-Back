import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql/error';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);
        const ctx = gqlHost.getContext();

        let statusCode = 500;
        let message = '서버 내부 오류가 발생했습니다.';
        let code = 'INTERNAL_SERVER_ERROR';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const response = exception.getResponse() as any;
            message = response.message || exception.message;
            code = response.code || this.getCodeFromStatus(statusCode);
        } else if (exception instanceof GraphQLError) {
            message = exception.message;
            code = 'GRAPHQL_ERROR';
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // 요청 정보 추출 (있는 경우)
        const reqInfo = ctx.req
            ? {
                  ip: ctx.req.ip,
                  method: ctx.req.method,
                  path: ctx.req.originalUrl,
                  // 인증된 사용자 정보도 추가 가능 (req.user가 있는 경우)
                  userId: ctx.req.user?.id || 'anonymous',
              }
            : {};

        // 로깅 - 요청 정보 포함
        console.error(
            `[GraphQLError] ${code}: ${message}`,
            { ...reqInfo, timestamp: new Date().toISOString() },
            exception.stack,
        );

        return new GraphQLError(message, {
            extensions: {
                code,
                statusCode,
                timestamp: new Date().toISOString(),
                reqInfo,
            },
        });
    }

    private getCodeFromStatus(status: number): string {
        switch (status) {
            case 400:
                return 'BAD_REQUEST';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
}
