import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreatePostCommentInput } from './create-post-comment.input';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdatePostCommentInput extends PartialType(CreatePostCommentInput) {
    @Field(() => String)
    @IsNotEmpty({ message: '작성자 ID는 필수입니다.' })
    @IsString()
    authorId: string;

    @Field(() => String)
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @IsString()
    password: string;
}
