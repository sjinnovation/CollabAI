import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import Cookies from 'js-cookie';
import { Spin, message } from 'antd';
import Logo from "../../assests/images/brandLogo/logoWithText.svg";
import { handleLogin, handleForgotPassword } from '../../api/auth';
import useAuth from '../../Hooks/useAuth';
import FormComponent from '../../component/common/FormComponent';
import { LoginFormFields } from '../../data/LoginFormFields';
import { ForgotPasswordFormFields } from '../../data/ForgotPasswordFormFields';
// import FormButton from '../../component/common/FormButton';
import FormLink from '../../component/common/FormLink';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import { axiosOpen, axiosSecureInstance } from '../../api/axios';
import { saveUserToLocalStorage } from '../../Utility/authHelper';

import OpenAILogo from '../../assests/images/OpenAI.png';
import AnthropicLogo from '../../assests/images/Anthropic.png';
import GeminiLogo from '../../assests/images/Gemini.png';
import { getUserRole } from '../../Utility/service';
import { getTeams } from '../../api/user';
import logoPath from '../../component/layout/logoPath';

const LoginForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [defaultValues, setDefaultValues] = useState({ email: '', password: '', remember: false });
  const [forgotPassword, setForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [emailDomainAuthorize, setEmailDomains] = useState([]);
  const [domainStatus, setDomainStatus] = useState();
  const [ssoCred, setSsoCred] = useState(false)
  const [logoUrl, setLogoUrl] = useState(Logo);

  useEffect(() => {
    const fetchGoogleSsoLoginCred = () => {
      try {
        const googleSsoCred = process.env.REACT_APP_SSO_LOGIN_PASSWORD;
        if (googleSsoCred) {
          setSsoCred(true)
        } else {
          setSsoCred(false)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchGoogleSsoLoginCred()

    const getLogo = async () => {
      const logo = await logoPath("logoWithText");
      if (logo) {
        setLogoUrl(logo);
        return;
      }
      setLogoUrl(Logo);
    };
    getLogo();
  }, [])

  useEffect(() => {
    const fetchEmailDomains = async () => {
      setSpinning(true);
      try {
        const response = await axiosSecureInstance.get('api/company/getall');

        const domainStatusMap = {};
        response.data.companies.forEach(item => {
          const domain = item.email.replace('@', '').toLowerCase();
          domainStatusMap[domain] = item.status;
        });

        setEmailDomains(Object.keys(domainStatusMap));
        setDomainStatus(domainStatusMap);
      } catch (error) {
        console.log(error);
      } finally {
        setSpinning(false);
      }
    };

    fetchEmailDomains();
  }, []);

  const handleLoginFormSubmit = (values) => {
    setSpinning(true);
    if (values.remember) {
      Cookies.set('rememberedEmail', values.email, { expires: 7 });
      Cookies.set('rememberedPassword', values.password, { expires: 7 });
      Cookies.set('rememberedRemember', values.remember, { expires: 7 });
    }
    setDefaultValues({ email: values.email, password: values.password, remember: values.remember })

    handleLogin(values.email, values.password).then((result) => {
      if (result?.success) {
        message.success(result?.message);
        setAuth({
          token: result.token,
          user: result.user,
        });
        setSpinning(false);
        navigate(result.slug);
      } else {
        setLoginError(result?.message)
        message.error(result?.message);
        setSpinning(false);
      }
    });
  };

  const handleForgotPasswordFormSubmit = async (values) => {
    setSpinning(true);

    handleForgotPassword(values.email).then((result) => {
      if (result.success) {
        message.success(result.message);
        setSpinning(false);
        setForgotPassword((currentValue) => !currentValue);
      } else {
        message.error(result.message);
        setSpinning(false);
      }
    });
  };

  const handleForgotPasswordSwitch = () => {
    setForgotPassword((currentValue) => !currentValue);
    setDefaultValues({ email: '', password: '', remember: false });
  };

  useEffect(() => {
    const storedEmail = Cookies.get('rememberedEmail');
    const storedPassword = Cookies.get('rememberedPassword');
    const storedRemember = Cookies.get('rememberedRemember');
    if (storedEmail && storedPassword) {
      setDefaultValues({ email: storedEmail, password: storedPassword, remember: storedRemember });
    }
  }, []);

  const googlePasswordSSO = process.env.REACT_APP_SSO_LOGIN_PASSWORD;

  const [teams, setTeams] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getTeams();
        const fetchedTeams = response.data.teams;
        const userTeam = fetchedTeams.find(team => team.teamTitle === 'USER');
        if (userTeam) {
          setTeams([userTeam]);
          setUserTeamId(userTeam._id);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTeams();
  }, []);


  const registerWithGoogle = async (userDetails) => {
    try {
      const data = {
        fname: userDetails.given_name,
        lname: userDetails.family_name,
        userAvatar: userDetails.picture || '',
        email: userDetails.email,
        password: googlePasswordSSO,
        username: userDetails.email,
        teams: userTeamId,
        isGoogleLogin: true,
        role: 'user',
        status: 'active'
      };

      const response = await axiosOpen.post('api/auth/google-auth', data);
      if (response.status === 200 || response.status === 201) {
        saveUserToLocalStorage(response?.data);
        message.success('Google login successful');
        navigate('/chat');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        if (errorMessage.includes('EMAIL_ALREADY_EXISTS') || errorMessage.includes('USERNAME_ALREADY_EXISTS')) {
          message.info('Google login successful');
          navigate('/chat');
        } else {
          message.error('Registration failed. Please try again.');
        }
      } else {
        message.error('An error occurred while registering. Please try again.');
      }
      console.error(error);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const userDetails = jwtDecode(credential);
    const emailDomain = userDetails.email.split('@')[1].toLowerCase();

    if (!emailDomainAuthorize.includes(emailDomain)) {
      message.error('Your email domain is not authorized');
      return;
    }

    if (domainStatus[emailDomain] === 'inactive') {
      message.error('Your email domain is not active');
      return;
    }

    await registerWithGoogle(userDetails);
  };




  return (
    <div>
      <div className="position-relative login-page">
        <div className="right-section">
          {forgotPassword && (
            <div className="form-signin">
              <div className="d-flex w-100">
                <BiArrowBack
                  style={{
                    fontSize: '35px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                  onClick={handleForgotPasswordSwitch}
                />
                <img
                  alt="brand logo"
                  src={logoUrl}
                  width="250"
                  height="auto"
                  className="mx-auto"
                />
              </div>

              <FormComponent
                title="Forgot Password"
                formItems={ForgotPasswordFormFields}
                handleSubmit={handleForgotPasswordFormSubmit}
                layout="vertical"
                className="form"
              />

            </div>
          )}

          {!forgotPassword && (
            <div className="form-signin">

              <div className='mb-1 ms-1 login-header'>
                <div className='login-logo-text'>
                  <img alt="brand logo" src={logoUrl} />
                  {/* <h4>Log in</h4> */}
                </div>
                <p className='login-page-info-text'>Enter your details below to sign into your account.</p>
                <h4 className='text-white'>Log in</h4>
              </div>

              <FormComponent
                // title="LOGIN"
                formItems={LoginFormFields}
                handleSubmit={handleLoginFormSubmit}
                defaultValues={defaultValues}
                layout="vertical"
                className="form  custom-login-form"
                loginError={loginError}
              />


              <div className='d-flex justify-content-start w-100 mt-3'>
                <FormLink
                  label="Forgot Password?"
                  variant="link"
                  htmlType="submit"
                  onClick={handleForgotPasswordSwitch}
                  className="forgot-link text-white border-0 bg-dark"
                  block="true"
                />
              </div>


              {ssoCred && <>
                <div className="d-flex align-items-center my-3 w-100 text-white">
                  <div className="flex-grow-1">
                    <hr className="m-0 border-top border-white" />
                  </div>
                  <span className="mx-2 my-2">
                    <div className="d-flex w-100 align-items-center">
                      <hr style={{ width: "50%" }} />
                      <small

                        className="text-capitalize text-secondary"
                      >

                      </small>
                      <span style={{
                        fontSize: "0.85rem",
                        lineHeight: "1rem",
                        padding: "0.5rem",
                        whiteSpace: "nowrap",
                        color: "white"
                      }}>or continue with</span>
                      <hr style={{ width: "50%", }} />
                    </div>

                  </span>
                  <div className="flex-grow-1">
                    <hr className="m-0 border-top border-white" />
                  </div>
                </div>

                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    message.error('Google login failed.');
                  }}
                  scope="openid profile email"
                />
              </>}

              <Spin
                spinning={spinning}
                fullscreen
                size="large"
              />
              <div className="text-white mt-3 bottom-font-size">
                Powered by
                <img className='login-page-logo ms-1' src={OpenAILogo} alt="OpenAILogo" />
                <img className='login-page-logo ms-1' src={AnthropicLogo} alt="AnthropicLogo" />
                <img className='login-page-logo ms-1' src={GeminiLogo} alt="GeminiLogo" /> | Developed by
                <a href="https://buildyourai.consulting/" target="_blank" className="underline pl-1 me-1">
                  <span> <u>BuildYourAI</u></span>
                </a>
                team
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 