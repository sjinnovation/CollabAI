import { axiosOpen } from './axios';
import { saveUserToLocalStorage } from '../Utility/authHelper';
import { 
    USER_LOGIN_API_SLUG, 
    USER_COMPANY_DATA_API_SLUG,
    USER_FORGOT_PASSWORD_API_SLUG,
    USER_RESET_PASSWORD_API_SLUG
} from '../constants/Api_constants';

export const handleLogin = async (email, password) => {
    try {
        const response = await axiosOpen.post(USER_LOGIN_API_SLUG, { email, password });
        const userRole = response?.data?.role === 'superadmin' ? '2010' : '2015';
        const compData = await axiosOpen.get(USER_COMPANY_DATA_API_SLUG(response?.data?.userid));

        saveUserToLocalStorage(response?.data);

        return {
            success: true,
            role: userRole,
            loggedIn: true,
            slug: compData.data.data != null
                  ? (response?.data?.role === 'superadmin' ? '/superadmin/users' : '/proposalform')
                  : '/chat',
            message: 'Login Successful',
        };
    } catch (err) {
        const errorMessage = err?.response?.data?.msg;
        if (err.response?.status === 401) {
            if (errorMessage === 'Not a active user') {
              return {
                success: false,
                message: err.response?.data?.message,
              };
            } else {
              return {
                success: false,
                message: err.response?.data?.message,
              };
            }
        }
    }
};


export const handleForgotPassword = async ( email ) => {
    try {
      await axiosOpen.post(USER_FORGOT_PASSWORD_API_SLUG, {
        email,
      });
      return {
        success: true,
        message: 'We have received your password reset request. Please check your email for further instructions.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred while sending the password reset email.',
      };
    }
};


export const handleResetPassword = async ( password, confirmPassword, token, id ) => {
  if (password !== confirmPassword) {
    return {
      success: false,
      message: 'Passwords do not match',
    };
  }

  try {
    const response = await axiosOpen.patch(USER_RESET_PASSWORD_API_SLUG, {
      userId: id,
      token,
      password,
    });

    if (response.status === 200) {
      return {
        success: true,
        slug: '/login',
        message: 'Your password has been successfully reset. You can now log in with your new password.',
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong while resetting your password. Please try again.',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};