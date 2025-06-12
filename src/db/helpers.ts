import { DbError } from '../todos/types';

export function isDbError(error: unknown): error is DbError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'cause' in error &&
    typeof (error as { cause?: unknown }).cause === 'object' &&
    (error as { cause: unknown }).cause !== null &&
    'code' in (error as { cause: { code?: unknown } }).cause &&
    typeof (
      (error as { cause: { code?: unknown } }).cause as { code?: unknown }
    ).code === 'string'
  );
}
