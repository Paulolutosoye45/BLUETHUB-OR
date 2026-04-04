import * as yup from 'yup';


// First-time login — password given to them, no complexity rules
export const firstLoginSchema = yup.object({
    userName: yup.string()
        .required()
        .matches(/^[a-zA-Z]+\.[a-zA-Z]+$/, "Username must be in the format firstname.lastname")
        .label("userName"),
    password: yup.string().required().label("Password"),
});

// Second-time login — they set their own password
export const loginSchema = yup.object({
    userName: yup.string()
        .required()
        .label("userName"),
    // userName: yup.string()
    //     .required()
    //     .matches(/^[a-zA-Z]+\.[a-zA-Z]+$/, "Username must be in the format firstname.lastname")
    //     .label("userName"),
    password: yup.string().required().label("Password"),
});


export const newPasswordSchema = yup.object({
    hashPassword: yup.string().required().label("Password"),
    password: yup
        .string()
        .required()
        .min(8)
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/,
            "Password must contain at least one letter and one number",
        )
        .label("Password"),
    confirmPassword: yup
        .string()
        .required()
        .oneOf([yup.ref("password")], "Passwords must match"),
});
