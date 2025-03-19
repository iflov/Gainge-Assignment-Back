import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePostInput {
    @Field(() => String)
    @IsNotEmpty({ message: '제목은 필수입니다.' })
    @IsString()
    title: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    content?: string | null;

    @Field(() => String)
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    @IsString()
    authorId: string;

    @Field(() => String)
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;
}
