export const FormFields = [
    { 
        name: "fullName", 
        label: "Full Name",
        type: "text",
        rules: [
            {
                required: true,
                message: "Please enter your name",
            },
            { whitespace: true },
            { min: 3 },
        ],
        placeholder:"Type your name"
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        rules: [
          {
            required: true,
            message: "Please enter your email",
          },
          { message: "Please enter a valid email" },
        ],
    },
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
        name: "gender", 
        label: "Gender",
        type: "select",
        options: [
            { value: 'male', label: 'Male' }, 
            { value: 'female', label: 'Female' }
        ],
    },
    {
        name: "dob",
        label: "Date of Birth",
        type: "datePicker",
        rules: [
          {
            required: true,
            message: "Please provide your date of birth",
          },
        ],
        placeholder: "Chose date of birth",
    },
    {
        name: "address",
        label: "Address",
        type: "textArea",
        rows: 4, 
        placeholder: "Enter your address", 
        maxLength: 100,
        showCount: true,
    },
    {
        name: "upload",
        type: 'fileUpload',
        label: "Click to Upload",
        multiple: true,
    },
    {
        name: "agreement",
        label: "Remember me",
        type: "checkbox",
    },
    {
        name: "submit",
        label: "Submit",
        type: "submit",
        htmlType: "submit",
        className: "btn-primary",
        block: true,
    },
]