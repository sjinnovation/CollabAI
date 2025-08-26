import { Button, Card, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import loader from "../../../assests/images/loader.svg";
import { changePassword, checkingCurrentPassword, retrieveUserProfile, userSSOPasswordUpdate } from '../../../api/profile';
import { isFieldEmpty } from '../../../Utility/helper';
import { getUserID } from '../../../Utility/service';

const PasswordChange = ({ userId }) => {
    const [passwordList, setPasswordList] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [createNewPassword, setCreateNewPassword] = useState("");
    const [passwordCondition, setPasswordCondition] = useState({
        initialPass: true,
        visibleCurrentPass: false,
        updatePassword: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [ssoCred, setSsoCred] = useState(false)

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
    }, [])

    const handleCheckingCurrentPassword = async () => {
        setIsLoading(true);
        try {
            const response = await checkingCurrentPassword(userId, passwordList.currentPassword);

            if (response?.data?.matchedPassword) {
                setPasswordCondition((prevState) => ({
                    ...prevState,
                    initialPass: false,
                    visibleCurrentPass: false,
                    updatePassword: true,
                }));
            }

            if (response?.status === 400) {
                message.error(response.response.data.message)
            }
        } catch (error) {
            message.error(error?.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            const response = await changePassword(userId, passwordList.newPassword, passwordList.confirmPassword);

            if (response?.data?.changedPassword) {
                setPasswordCondition({
                    initialPass: true,
                    visibleCurrentPass: false,
                    updatePassword: false,
                });
                message.success(response?.data?.message);
            }
            if (response?.status === 400) {
                message.error(response.response.data.message)
            }
        } catch (error) {
            console.error(error);
        }
    };

    const userIds = getUserID();
    const [userInfo, setUserInfo] = useState({});
   
    useEffect(() => {
        retrieveUserProfile(userIds).then((users) => {
            console.log(users)
            setUserInfo(users);
        });
    }, [userId]);

    const handleCreateNewPassword = async () => {
        try {
            const response = await userSSOPasswordUpdate(userId, createNewPassword);
            if (response?.data?.changedPassword) {
                setPasswordCondition({
                    initialPass: true,
                    visibleCurrentPass: false,
                    updatePassword: false,
                });
                setUserInfo((prevState) => (
                    {...prevState, isGoogleLogin: false}
                ))
                message.success(response?.data?.message);
            }
            if (response?.status === 400) {
                message.error(response.response.data.message)
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            {(userInfo.isGoogleLogin === true && ssoCred && (userInfo?.password === process.env.REACT_APP_SSO_LOGIN_PASSWORD)) ? (
                <div>
                    <Card title="Create New Password" className="profile-card__container">
                    <Form onFinish={handleCreateNewPassword}>
                                <Form.Item style={{ margin: 0 }}>
                                    <Input.Password
                                        name="newPassword"
                                        placeholder="New Password"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        autoComplete="new-password"
                                        style={{ marginBottom: "10px" }}
                                        onChange={(e) => setCreateNewPassword(e.target.value)}
                                    />
                                </Form.Item>
                                <Form.Item style={{ margin: 0 }}>
                                    <Button
                                        type="primary"
                                        block
                                        style={{ backgroundColor: "#2952BF", color: "#fff", padding: "10px" }}
                                        htmlType="submit" 
                                    >
                                        {isLoading ? <img style={{ width: "25px" }} src={loader} alt="loader" /> : "Create Password"}
                                    </Button>
                                </Form.Item>
                            </Form>
                    </Card>
                </div>
            ) : (
                <div>
                    <Card title="Update Password" className="profile-card__container">
                        {passwordCondition.initialPass && !passwordCondition.updatePassword && !passwordCondition.visibleCurrentPass && (
                            <Button
                                onClick={() => setPasswordCondition({ initialPass: false, visibleCurrentPass: true, updatePassword: false })}
                                block
                                style={{ backgroundColor: "#2952BF", color: "#fff", padding: "10px" }}
                            >
                                Change Password
                            </Button>
                        )}
                        {!passwordCondition.initialPass && passwordCondition.visibleCurrentPass && !passwordCondition.updatePassword && (
                            <Form onFinish={handleCheckingCurrentPassword}>
                                <Form.Item style={{ margin: 0 }}>
                                    <Input.Password
                                        name="currentPassword"
                                        placeholder="Current Password"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        autoComplete="new-password"
                                        style={{ marginBottom: "10px" }}
                                        onChange={(e) => setPasswordList((prevState) => ({ ...prevState, currentPassword: e.target.value }))}
                                    />
                                </Form.Item>
                                <Form.Item style={{ margin: 0 }}>
                                    <Button
                                        type="primary"
                                        block
                                        style={{ backgroundColor: "#2952BF", color: "#fff", padding: "10px" }}
                                        disabled={isFieldEmpty(passwordList?.currentPassword)}
                                        htmlType="submit" 
                                    >
                                        {isLoading ? <img style={{ width: "25px" }} src={loader} alt="loader" /> : "Submit"}
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                        {!passwordCondition.initialPass && !passwordCondition.visibleCurrentPass && passwordCondition.updatePassword && (
                            <>
                                <Input.Password
                                    type="password"
                                    name="newPassword"
                                    placeholder="New Password"
                                    autoComplete="new-pass"
                                    style={{ marginBottom: "10px" }}
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    onChange={(e) => setPasswordList((prevState) => ({ ...prevState, newPassword: e.target.value }))}
                                />
                                <Input.Password
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    autoComplete="con-pass"
                                    style={{ marginBottom: "10px" }}
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    onChange={(e) => setPasswordList((prevState) => ({ ...prevState, confirmPassword: e.target.value }))}
                                />
                                <Button
                                    onClick={handleChangePassword}
                                    block
                                    style={{ backgroundColor: "#2952BF", color: "#fff", padding: "10px" }}
                                    disabled={isFieldEmpty(passwordList?.newPassword) || isFieldEmpty(passwordList?.confirmPassword)}
                                >
                                    Change Password
                                </Button>
                            </>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PasswordChange;