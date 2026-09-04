import { MOCK_USERS } from '../data/mockData';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(email, password) {
  await delay();
  let role = 'admin';
  if (email.includes('faculty')) role = 'faculty';
  if (email.includes('student')) role = 'student';
  const user = MOCK_USERS[role];
  return {
    success: true,
    token: 'mock-jwt-token-' + role,
    user,
  };
}

export async function getCurrentUser() {
  await delay();
  const storedUser = localStorage.getItem('erp_user');
  if (storedUser) {
    return { success: true, user: JSON.parse(storedUser) };
  }
  return { success: true, user: MOCK_USERS.admin };
}
