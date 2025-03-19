import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreatePostInput {
    @Field()
    @IsNotEmpty({ message: '제목은 필수입니다.' })
    @IsString()
    title: string;

    @Field({ nullable: true })
    @IsString()
    content?: string | null;

    @Field()
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    @IsString()
    authorId: string;

    @Field()
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;
}
