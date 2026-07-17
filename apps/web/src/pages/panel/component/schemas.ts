import * as yup from "yup";

export const step1Schema = yup.object().shape({
  schoolName: yup
    .string()
    .trim()
    .required("School name is required")
    .min(2, "School name must be at least 2 characters"),
  schoolLogo: yup
    .mixed()
    .nullable()
    .test(
      "fileSize",
      "Logo must be less than 200KB",
      (value) => !value || (value instanceof File && value.size <= 200 * 1024)
    )
    .test(
      "fileType",
      "Only image files are allowed (PNG, JPEG, WEBP, SVG)",
      (value) =>
        !value ||
        (value instanceof File &&
          ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(value.type))
    ),
  schoolAddress: yup
    .string()
    .trim()
    .required("School address is required")
    .min(5, "Please enter a valid address"),
  country: yup
    .string()
    .trim()
    .required("Please select a country"),
  state: yup
    .string()
    .trim()
    .required("Please select a state / province"),
  city: yup.string().optional(),
  branch: yup.string().optional(),
});

export const step2Schema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  phone: yup.string().optional(),
  roleDescription: yup.string().optional(),
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, hyphens and underscores"
    ),
  secretPhrase: yup
    .string()
    .trim()
    .required("Secret phrase is required")
    .min(4, "Secret phrase must be at least 4 characters"),
  phraseAnswer: yup
    .string()
    .trim()
    .required("Phrase answer is required")
    .min(2, "Answer must be at least 2 characters"),
  acknowledged: yup
    .boolean()
    .oneOf([true], "You must confirm that you have saved your secret phrase & answer"),
});

export type Step1FormData = yup.InferType<typeof step1Schema>;
export type Step2FormData = yup.InferType<typeof step2Schema>;
