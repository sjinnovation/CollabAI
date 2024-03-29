export const LoginFormFields = [
    {
        name: "email",
        type: "email",
        rules: [
            {
                required: true,
            },
        ],
        placeholder: "Enter your email",
    },
    {
        name: "password",
        type: "password",
        rules: [
            { required: true, message: 'Please input your password!' },
        ],
        placeholder: "Enter your password",
    },
    {
        name: "remember",
        label: "Remember me",
        type: "checkbox",
        className:"m-0"
    },
    {
        name: "submit",
        label: "Login",
        type: "submit",
        htmlType: "submit",
        className: "btn-primary mt-4",
        buttonType: "primary",
        block: true,
    },
]