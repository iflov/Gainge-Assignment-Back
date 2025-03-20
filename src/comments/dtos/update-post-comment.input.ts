import { Field, InputType, PickType } from '@nestjs/graphql';
import { CreatePostCommentInput } from './create-post-comment.input';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePostCommentInput extends PickType(CreatePostCommentInput, [
    'authorId',
    'password',
]) {
    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    content?: string;
}
