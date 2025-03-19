import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeletePostCommentInput {
    @Field(() => String)
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    @IsString()
    authorId: string;

    @Field(() => String)
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;
}
