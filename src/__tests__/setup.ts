import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = mockDeep<PrismaClient>();

// Add a dummy test to prevent the "no tests" warning
describe('Test Setup', () => {
  it('should set up test environment', () => {
    expect(prismaMock).toBeDefined();
  });
});