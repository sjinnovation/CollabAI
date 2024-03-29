import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import NewLogo from '../../assests/images/NewLogo.png';
import { handleResetPassword } from '../../api/auth';
import { ResetPasswordFromFields } from '../../data/ResetPasswordFromFields';
import FormComponent from '../../component/common/FormComponent';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token, id } = useParams();
  const [spinning, setSpinning] = useState(false);

  const handleResetPasswordFormSubmit = (values) => {
    setSpinning(true);
    handleResetPassword(values.password, values.confirmPassword, token, id).then((result) => {
      if (result.success) {
        setTimeout(() => {
          message.success(result.message);
          setSpinning(false);
          navigate(result.slug);
        }, 3000);
      }else{
        message.error(result.message);
        setSpinning(false);
      }
    });
  };

  return (
    <div>
      <div className="position-relative login-page">
        <div className="right-section">
          <div className="form-signin">
            <div className="mb-2">
              <img alt="brand logo" src={NewLogo} width="250" height="auto" />
            </div>

            <FormComponent
              title="New Password"
              formItems={ResetPasswordFromFields}
              layout="vertical"
              handleSubmit={handleResetPasswordFormSubmit}
              className="form mt-4"
            />

            <Spin 
              spinning={spinning} 
              fullscreen
              size = "large"
            />

            <div className="copyright">
              <Link
                href="https://sjinnovation.com/"
                target="_blank"
              >
                Powered by BuildYourAI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;