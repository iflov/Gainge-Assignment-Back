import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';
import {AppResolver} from "../app.resolver";

describe('AppResolver', () => {
  let appResolver: AppResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppResolver, AppService],
    }).compile();

    appResolver = app.get<AppResolver>(AppResolver);
  });

  // GraphQL
  describe('query test', () => {
    it('should return "Hello World!"', async () => {
      expect(await appResolver.get_hello()).toBe('Hello World!');
    });
  });

  describe('mutation test', () => {
    it('should return "Hello World!"', async () => {
      expect(await appResolver.create_hello()).toBe('Hello World!');
    });
  });
});
