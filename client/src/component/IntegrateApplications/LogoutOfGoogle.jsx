import { GoogleLogout } from 'react-google-login';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const LogoutOfGoogle = ()=>{
    const responseGoogleSuccess = (res) => {
        console.log("Login successful ,profile :", res.profileObj);

    }
    const responseGoogle = (res) => {
        console.log("Login failed:", res.profileObj);

    }
    return (
        <div id="signInButton">
            <GoogleLogout
                clientId={CLIENT_ID}
                buttonText="Logout"
                onSuccess={responseGoogleSuccess}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
            />
        </div>

    );
};