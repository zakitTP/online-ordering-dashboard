import axios from 'axios';
import { setUser, clearUser, setLoading } from '../lib/userSlice'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const fetchCurrentUser = async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axios.get(`${API_BASE_URL}/api/user`, {
      withCredentials: true,
    });
    if (res.status == 200) {
      dispatch(setUser(res.data));
    } else {
      dispatch(clearUser());
    }
  } catch (error) {
    dispatch(clearUser());
    console.error('Error fetching user:', error);
  }
};
