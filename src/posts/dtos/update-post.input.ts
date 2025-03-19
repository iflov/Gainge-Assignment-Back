import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.input';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
    @Field()
    @IsNumber()
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    authorId: string;

    @Field()
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;
}
