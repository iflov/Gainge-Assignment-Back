import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreatePostCommentInput {
    @Field(() => String)
    @IsNotEmpty({ message: '댓글 내용은 필수입니다.' })
    @IsString()
    content: string;

    @Field(() => String)
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    @IsString()
    authorId: string;

    @Field(() => String)
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;

    @Field(() => Int)
    @IsNotEmpty({ message: '게시글 ID는 필수입니다.' })
    @IsNumber()
    postId: number;
}
