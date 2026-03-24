import { LOGIN_CREDENTIALS, API_ENDPOINTS } from '../config';
import { api } from './axiosService';


export const loginApi = async () => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, LOGIN_CREDENTIALS)
    const Json = response?.data?.data?.data
    localStorage.setItem('accessToken', Json.token?.token);
    localStorage.setItem('userId', Json.user?.id);
    // localStorage.setItem('refreshToken',Json.user);
    return response.data;
  } catch (error) {
    throw error;
  }
};
