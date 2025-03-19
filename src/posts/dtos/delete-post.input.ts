import { InputType, PickType } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.input';

@InputType()
export class DeletePostInput extends PickType(CreatePostInput, ['authorId', 'password']) {}
