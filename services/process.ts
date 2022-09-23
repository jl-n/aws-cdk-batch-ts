import { update } from './lib/airtable'

export const processData = async <T, R>(config: {
  log: ReturnType<typeof update>
  data: string
}) => {
  config.log({ Status: 'In progress' })
  console.log('process.ts was called with the following data: ', config.data)
  return `Original: ${config.data}, Uppercase: ${config.data.toUpperCase()}!`
}
