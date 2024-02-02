export const ResetPasswordFromFields = [
    {
        name: "password",
        label: "Password",
        type: "password",
        rules: [
            () => ({
                validator(_, value) {
                    if (!value) {
                        return Promise.reject(new Error('Please input your password!'));
                    }
                    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value)) {
                        return Promise.reject(new Error('Password must contain at least one uppercase, one lowercase, one number, one special character and must be at least 8 characters long!'));
                    }
                    return Promise.resolve();
                },
            }),
        ],
    },
    {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        dependencies: ["password"],
        rules: [
            {
            required: true,
            },
            ({ getFieldValue }) => ({
                validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
                }
                return Promise.reject(
                "The two passwords that you entered does not match."
                );
            },
            }),
        ],
    },
    {
        name: "submit",
        label: "Reset Password",
        type: "submit",
        htmlType: "submit",
        className: "btn-primary mt-4",
        buttonType: "primary",
        block: true,
    },
]