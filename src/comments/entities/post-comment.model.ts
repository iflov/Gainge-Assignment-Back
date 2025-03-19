import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/entities/posts.model';

@ObjectType()
export class PostComment {
    @Field(() => Int)
    id: number;

    @Field()
    content: string;

    @Field()
    authorId: string;

    @HideField()
    password?: string;

    @Field(() => Int)
    postId: number;

    @Field(() => Post)
    post: Post;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
