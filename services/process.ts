import { update } from './lib/airtable'
import { BatchParameters } from '../shared/types'

export const processData = async <T, R>(config: {
  log: ReturnType<typeof update>
  data: string
}) => {
  config.log({ Status: 'processing' })
  console.log('process.ts was called with the following data: ', config.data)
  return `Here is the original string, but now uppercase: ${config.data.toUpperCase()}`
}
