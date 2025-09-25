import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
export const fetchFrappeUsers = async () => {
  try {
    const response = await axios.get(
      'https://projectsrp-sandbox.srp.ai/api/resource/Employee?fields=["name", "first_name", "last_name","company","status", "date_of_joining", "reports_to", "user_id"]',
      {
        headers: {
          Authorization: process.env.FRAPPE_API_KEY,
        },
      },
    );
    return response?.data ?? [];
  } catch (error: any) {
    return { message: error.message };
  }
};
