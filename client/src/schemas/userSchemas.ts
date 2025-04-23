import * as yup from 'yup';

export const regSchema = yup.object().shape({
  login: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(64, "Логин не может превышать 64 символа")
    .matches(/^\S*$/, "Логин не должен содержать пробелы"),
  password: yup.string()
    .required("Пароль должен содержать не менее 6 символов")
    .min(6, "Пароль должен содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
  lastName: yup.string()
    .required("Обязательное поле")
    .max(64, "Фамилия не может превышать 64 символа")
    .matches(/^\S*$/, "Фамилия не должна содержать пробелы"),
  firstName: yup.string()
    .required("Обязательное поле")
    .max(64, "Имя не может превышать 64 символа")
    .matches(/^\S*$/, "Имя не должно содержать пробелы"),
  middleName: yup.string()
    .optional()
    .max(64, "Отчество не может превышать 64 символа")
    .matches(/^\S*$/, "Отчество не должно содержать пробелы"),
  role: yup.number()
    .required()
    .default(1),
});

export const logSchema = yup.object().shape({
  login: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(64, "Логин не может превышать 64 символа")
    .matches(/^\S*$/, "Логин не должен содержать пробелы"),
  password: yup.string()
    .required("Пароль должен содержать не менее 6 символов")
    .min(6, "Пароль должен содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
});

export const profileSchema = yup.object().shape({
  lastName: yup.string()
    .required("Обязательное поле")
    .max(64, "Фамилия не может превышать 64 символа")
    .matches(/^\S*$/, "Фамилия не должна содержать пробелы"),
  firstName: yup.string()
    .required("Обязательное поле")
    .max(64, "Имя не может превышать 64 символа")
    .matches(/^\S*$/, "Имя не должно содержать пробелы"),
  middleName: yup.string()
    .optional()
    .max(64, "Отчество не может превышать 64 символа")
    .matches(/^\S*$/, "Отчество не должно содержать пробелы")
});

export const passwordSchema = yup.object().shape({
  oldPassword: yup.string()
    .required("Введите старый пароль")
    .min(6, "Пароль не может содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы"),
  newPassword: yup.string()
    .required("Введите новый пароль")
    .min(6, "Пароль должен содержать не менее 6 символов")
    .matches(/^\S*$/, "Пароль не должен содержать пробелы")
    .notOneOf([yup.ref('oldPassword')], "Новый пароль не должен совпадать со старым паролем"),
  confirmNewPassword: yup.string()
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
    .required("Подтвердите новый пароль"),
});