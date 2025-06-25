import { type UUID } from 'crypto';

export type UpdateTodo = {
  title?: string;
  description?: string;
  completed?: boolean;
};

export type NewTodo = {
  userId: UUID;
  title: string;
  description?: string;
  completed?: boolean;
};

export type Todo = {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DbError = {
  query: string;
  params: unknown[];
  cause: {
    length: number;
    name: string;
    severity: string;
    code: string;
    detail: string;
    schema: string;
    table: string;
    originalLine: number;
    originalColumn: number;
    constraint: string;
    file: string;
    routine: string;
    stack: string;
  };
  stack: string;
};
