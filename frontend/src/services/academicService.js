import { MOCK_DEPARTMENTS, MOCK_COURSES } from '../data/mockData';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDepartments() {
  await delay();
  return { success: true, count: MOCK_DEPARTMENTS.length, data: MOCK_DEPARTMENTS };
}

export async function getCourses(params = {}) {
  await delay();
  let filtered = [...MOCK_COURSES];
  if (params.department_id) {
    filtered = filtered.filter((c) => c.department_id === Number(params.department_id));
  }
  if (params.semester) {
    filtered = filtered.filter((c) => c.semester === Number(params.semester));
  }
  return { success: true, count: filtered.length, data: filtered };
}
