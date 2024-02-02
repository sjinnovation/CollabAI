export const ForgotPasswordFormFields = [
    {
        name: "email",
        type: "email",
        rules: [
            {
                required: true,
                max: 3,
                type: 'email',
            },
        ],
        placeholder: "Enter your email",
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