import * as yup from 'yup';

export const testSchema = yup.object().shape({
  title: yup.string()
    .required("Обязательное поле")
    .max(100, "Название не может превышать 100 символов")
    .trim(),
  description: yup.string()
    .max(500, "Описание не может превышать 500 символов")
    .trim()
    .optional()
});