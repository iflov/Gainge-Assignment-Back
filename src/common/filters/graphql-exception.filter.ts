import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GraphQLExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);
        const ctx = gqlHost.getContext();
        const request = ctx.req || {}; // 요청 정보 가져오기

        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            const status = exception.getStatus();

            // NestJS 에러 로깅
            this.logger.error(`HTTP Error: ${JSON.stringify(response)}`, {
                statusCode: status,
                path: request.path,
                method: request.method,
                userId: request.user?.id || 'anonymous',
            });

            // GraphQL 형식으로 변환하여 상세 정보 포함
            return new GraphQLError(typeof response === 'string' ? response : response['message'], {
                extensions: {
                    code: status === 400 ? 'BAD_USER_INPUT' : 'INTERNAL_SERVER_ERROR',
                    statusCode: status,
                    path: request.path || 'unknown',
                    method: request.method || 'unknown',
                    userId: request.user?.id || 'anonymous',
                    errors: typeof response === 'object' ? response : null,
                },
            });
        }

        // 기타 알 수 없는 에러 처리
        this.logger.error(`Unexpected Error: ${exception}`, {
            path: request.path,
            method: request.method,
            userId: request.user?.id || 'anonymous',
        });

        return new GraphQLError('Internal Server Error', {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                path: request.path || 'unknown',
                method: request.method || 'unknown',
                userId: request.user?.id || 'anonymous',
            },
        });
    }
}
