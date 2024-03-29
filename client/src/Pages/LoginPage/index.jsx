import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import Cookies from 'js-cookie';
import { Spin, message } from 'antd';
import NewLogo from '../../assests/images/NewLogo.png';
import { handleLogin, handleForgotPassword } from '../../api/auth';
import useAuth from '../../Hooks/useAuth';
import FormComponent from '../../component/common/FormComponent';
import { LoginFormFields } from '../../data/LoginFormFields';
import { ForgotPasswordFormFields } from '../../data/ForgotPasswordFormFields';
import FormButton from '../../component/common/FormButton';

const LoginForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [defaultValues, setDefaultValues] = useState({ email: '', password: '', remember: false});
  const [forgotPassword, setForgotPassword] = useState(false);

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
                  src={NewLogo}
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
              <div className="mb-2">
                <img alt="brand logo" src={NewLogo} width="250" height="auto" />
              </div>

              <FormComponent
                title="LOGIN"
                formItems={LoginFormFields}
                handleSubmit={handleLoginFormSubmit}
                defaultValues={defaultValues}
                layout="vertical"
                className="form mb-4"
              />

              
              

              <FormButton
                label="Forgot Password?"
                variant="link"
                htmlType="submit"
                onClick={handleForgotPasswordSwitch} 
                className="forgot-link text-decoration-non text-white"
                block="true"
              />

              <Spin 
                spinning={spinning} 
                fullscreen
                size = "large"
              />
              <div className="copyright">
                Powered by
                <a href="https://buildyourai.consulting/" target="_blank" className="underline pl-1">
                  BuildYourAI
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;