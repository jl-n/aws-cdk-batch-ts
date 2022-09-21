import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch'

import { BatchParameters, LambdaPayload } from '../../shared/types'
import { log } from '../lib/airtable'

const error = (body: string) => ({
  statusCode: 400,
  headers: { 'Content-Type': 'application/json' },
  body: body,
})

const batch = new BatchClient({})

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const parsed = LambdaPayload.safeParse(JSON.parse(event.body || ''))
  if (!parsed.success) return error('There was an error.')

  const airtable_record_id = await log({
    Name: '',
    Notes: '',
    Status: 'starting',
  }).then((x) => x.airtable_record_id)

  const params: BatchParameters = {
    airtable_record_id,
    name: parsed.data.name,
    sample_content: parsed.data.sample_content,
  }

  const command = new SubmitJobCommand({
    jobDefinition: process.env.BATCH_JOB_DEFINITION,
    jobQueue: process.env.BATCH_JOB_QUEUE,
    jobName: `${parsed.data.name}-${new Date()
      .toISOString()
      .replaceAll(':', '_')}`,
    parameters: { params: JSON.stringify(params) },
  })

  const res = await batch.send(command)
  console.log(res)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: `Job ${parsed.data.name} has been submitted!`,
  }
}
