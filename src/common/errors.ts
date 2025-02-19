import { Static, Type } from '@sinclair/typebox';

export const ErrorDtoSchema = Type.Object({
  code: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});

export type ErrorDto = Static<typeof ErrorDtoSchema>;

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}
