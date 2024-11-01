import { useGoogleLogin } from '@react-oauth/google';
import { axiosSecureInstance } from '../../api/axios';
import { GOOGLE_AUTH_SLUG } from '../../constants/Api_constants';
import { getUserID } from '../../Utility/service';
import { FaGoogleDrive } from 'react-icons/fa6';
import googleDriveIcon from '../../assests/images/google-drive-icon.png';

const userId = getUserID();

export const LoginWithGoogle = ({ setToken, setIsConnected }) => {
    // Initialize Google login hook
    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const body = { userId: userId, code: codeResponse.code };
            const response = await axiosSecureInstance.post(GOOGLE_AUTH_SLUG, body);
            const accessToken = response?.data?.accessToken;
            setToken(accessToken);
            setIsConnected(true);


        },
        flow: 'auth-code',
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
        prompt: 'consent',
    });

    return (
        <div>
            <li onClick={login} > <FaGoogleDrive /> Import From Google Drive (Max : 1.5MB)</li>

        </div>
    );
};
