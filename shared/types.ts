import { z } from 'zod'

export const BatchParameters = z.object({
  name: z.string(),
  airtable_record_id: z.string(),
  sample_content: z.string(),
})
export type BatchParameters = z.infer<typeof BatchParameters>

export const LambdaPayload = z.object({
  name: z.string(),
  sample_content: z.string(),
  token: z.string(),
})
export type LambdaPayload = z.infer<typeof LambdaPayload>
