import { Resolver, Query, Mutation, } from "@nestjs/graphql";
import { AppService } from "./app.service";

@Resolver()
export class AppResolver {
    constructor(private readonly appService: AppService) {
    }

  // Query
  @Query(() => String)
  async get_hello(): Promise<string> {
    return this.appService.getHello();
  }

  // Mutation
  @Mutation(() => String)
  async create_hello(): Promise<string> {
    return this.appService.getHello();
  }
}