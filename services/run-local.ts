import { BatchParameters } from 'shared/types'
import { processData } from './process'

const sample: BatchParameters = {
  name: 'test-name',
  sample_content: 'this-is-sample-content',
  airtable_record_id: '',
}

const start = Date.now()
const { name, sample_content } = sample

console.log('Processing data: ', name)
const result = await processData({
  log: console.log as any,
  data: sample_content,
})

console.log(result)
console.log(`Completed in ${Date.now() - start}ms ✨`)
