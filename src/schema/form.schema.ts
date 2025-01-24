import * as yup from 'yup';

export const translationSchema = yup.object().shape({
  translations: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Name is required'),
      language: yup
        .object()
        .shape({
          value: yup.string().required('Language is required'),
          label: yup.string(),
        })
        .nullable()
        .required('Language is required'),
    })
  ),
})

export type translationType = yup.InferType<typeof translationSchema>