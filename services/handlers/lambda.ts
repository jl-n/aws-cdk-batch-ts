import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch'

import { BatchParameters, LambdaPayload } from '../../shared/types'
import { log } from '../lib/airtable'

const batch = new BatchClient({})

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const parsed = LambdaPayload.safeParse(JSON.parse(event.body || ''))
  if (!parsed.success) return response(400, { message: 'There was an error.' })
  if (parsed.data.token !== process.env.CLIENT_TOKEN || '') {
    return response(403, { message: 'Incorrect token supplied.' })
  }

  const airtable_record_id = await log({
    Name: parsed.data.name,
    Notes: '',
    Status: 'Todo',
  }).then((x) => x.airtable_record_id)

  const params: BatchParameters = {
    airtable_record_id,
    name: `job-${format(parsed.data.name)}-${format(new Date().toISOString())}`,
    sample_content: parsed.data.sample_content,
  }

  const command = new SubmitJobCommand({
    jobDefinition: process.env.BATCH_JOB_DEFINITION,
    jobQueue: process.env.BATCH_JOB_QUEUE,
    jobName: params.name,
    parameters: { params: JSON.stringify(params) },
  })

  await batch.send(command)

  return response(200, {
    message: `The job "${parsed.data.name}" has been submitted!`,
  })
}

const response = (statusCode: number, body: object) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const format = (x: string) =>
  x.trim().replaceAll(':', '_').replaceAll('.', '-').replaceAll(' ', '-')
