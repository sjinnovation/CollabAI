import { GoogleLogin } from "@react-oauth/google";

export const GetGoogleLogin = ({setToken}) => {
    return (
        <div>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    setToken(credentialResponse.credential)
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
                useOneTap
                scope="https://www.googleapis.com/auth/drive.appdata" 
                access_type="offline"  // Request access token with refresh token
                response_type="token"  
            />
        </div>
    );
}