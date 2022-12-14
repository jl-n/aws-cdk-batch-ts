import { LambdaPayload } from 'shared/types'

export const post = (data: LambdaPayload) =>
  fetch(import.meta.env.VITE_API_URL, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((x) => x.json())
