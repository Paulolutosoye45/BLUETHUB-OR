import * as yup from 'yup';


// First-time login — password given to them, no complexity rules
export const firstLoginSchema = yup.object({
    userName: yup.string()
        .required()
        .matches(/^[a-zA-Z]+\.[a-zA-Z]+$/, "Username must be in the format firstname.lastname")
        .label("userName"),
    password: yup.string().required().label("Password"),
});

export const regUserSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .trim()
    .min(2, "First name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters")
    .label("First Name"),

     email: yup.string().required().email().label("Email"),

  lastName: yup
    .string()
    .required("Last name is required")
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
    .label("Last Name"),

  middleName: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .matches(/^[a-zA-Z\s]*$/, "Middle name can only contain letters")
    .label("Middle Name"),

  // These will be automatically set in your form logic (not by user)
  username: yup
    .string()
    .required()
    .label("Username"),

    dateOfBirth: yup
  .date()
  .required('Date of birth is required')
  .max(new Date(), 'Date of birth cannot be in the future')
  .typeError('Please select a valid date'),

  password: yup
    .string()
    .required()
    .label("Password"),
});

export type RegisterFormData = yup.InferType<typeof regUserSchema>;

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




export const UserRole = {
  Student: 0,
  HeadTeacher: 1,
  Administrator: 2,
  SuperAdministrator: 3,
  SubjectTeacher: 4,
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabels: Record<UserRoleType, string> = {
  [UserRole.Student]: "Student",
  [UserRole.HeadTeacher]: "Head Teacher",
  [UserRole.Administrator]: "Administrator",
  [UserRole.SuperAdministrator]: "Super Administrator",
  [UserRole.SubjectTeacher]: "Subject Teacher",
};



export const studentFormSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),

  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),

  middleName: yup
    .string()
    .trim()
    .max(50, 'Middle name must not exceed 50 characters')
    .optional(),

  username: yup
    .string()
    .trim()
    .optional(),

dateOfBirth: yup
  .date()
  .required('Date of birth is required')
  .max(new Date(), 'Date of birth cannot be in the future')
  .typeError('Please select a valid date'),

  guardianName: yup
    .string()
    .trim()
    .max(100, 'Guardian name must not exceed 100 characters')
    .optional(),
});

export type StudentFormValues = yup.InferType<typeof studentFormSchema>;