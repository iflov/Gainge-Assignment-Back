import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
    @Field(() => Int)
    id: number;

    @Field()
    title: string;

    @Field(() => String, { nullable: true })
    content?: string | null;

    @Field()
    authorId: string;

    @HideField()
    password: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
