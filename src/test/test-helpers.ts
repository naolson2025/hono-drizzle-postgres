import { NewTodo } from '../todos/types';

export const signupReq = (
  email = 'test@test.com',
  password = 'password123'
) => {
  return new Request('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const loginReq = (email = 'test@test.com', password = 'password123') => {
  return new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const logoutReq = () => {
  return new Request('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createTodoReq = (
  cookie?: string,
  newTodo?: Omit<NewTodo, 'userId'>
) => {
  return new Request('http://localhost/api/protected/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie || '',
    },
    body: JSON.stringify({
      title: newTodo?.title || 'Default Todo Title',
      description: newTodo?.description || 'Default Todo Description',
      completed: newTodo?.completed || false,
    }),
  });
};
