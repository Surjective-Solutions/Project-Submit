import { dashboardData } from './mockData';

// The data for the teacher's dashboard.
//
//   GET /api/teacher-dashboard  ->  the object in mockData.js
//
// The server works everything out for the signed-in teacher only (taken from the access token, never from the request):
// their own classes, students, fees, attendance and notices. `asOf` is the server's local time. Money is a number of
// rupees; percentages are whole numbers.
//
// For now it returns the sample data. To use the real endpoint, replace the body with:
//   return protectedRequestPath('/api/teacher-dashboard', { method: 'GET' });   // from '@/lib/api-client'
export async function getTeacherDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return structuredClone(dashboardData);
}
