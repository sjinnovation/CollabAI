export const LoginFormFields = [
    {
        name: "email",
        type: "email",
        rules: [
            {
                required: true,
                message: 'Please enter your email!',
            },
        ],
        placeholder: "Enter your email",
        inputFieldClassName:"bg-dark text-white",
    },
    {
        name: "password",
        type: "password",
        rules: [
            { required: true, message: 'Please enter your password!' },
        ],
        placeholder: "Enter your password",
        inputFieldClassName:"bg-dark text-white",
    },
    {
        name: "remember",
        label: "Remember me",
        type: "checkbox",
        className: "m-0",
        labelClassName: "text-white"
    },
    {
        name: "submit",
        label: "Log in",
        type: "submit",
        htmlType: "submit",
        className: "login-btn btn-primary mt-4",
        buttonType: "primary",
        block: true,
    },
]