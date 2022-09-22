import minimist from 'minimist'

import { BatchParameters } from '../shared/types'
import { update } from './lib/airtable'
import { upload } from './lib/s3'
import { processData } from './process'

let argv = minimist(process.argv)
// console.log('argv.parameters', argv.parameters)
let parsed = BatchParameters.safeParse(JSON.parse(argv.params))
if (!parsed.success) {
  throw `Unable to parse --params: ${parsed.error.toString()}`
}

const start = Date.now()
const { name, sample_content, airtable_record_id } = parsed.data

// Process the data
const result = await processData({
  log: update(airtable_record_id),
  data: sample_content,
})

console.log('Uploading file: ', name)
const s3_url = await upload(`${name}.txt`, result)
console.log('Location: ', s3_url)

await update(airtable_record_id)({ Status: 'Done', Notes: s3_url })
console.log(`Completed in ${Date.now() - start}ms ✨`)
