import * as yup from 'yup';

export const articleSchema = yup.object().shape({
  title: yup.string()
    .trim()
    .required("Обязательное поле")
    .max(60, "Название не может превышать 60 символов"),
  description: yup.string()
    .trim()
    .optional()
    .max(250, "Описание не может превышать 250 символов"),
  content: yup.string()
    .required("Обязательное поле")
    .max(30000, "Текст не может превышать 30000 символов"),
});