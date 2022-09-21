import Airtable, { FieldSet, Record, Collaborator } from 'airtable'

/**
 * You might find it more pragmatic to hardcode the values here
 * so you can use this utility inside the Lambda handler and Docker
 * container without managing environment variables.
 */

// Populate with your own paramters:
const AIRTABLE_API_KEY = 'XXXXXXXX'
const AIRTABLE_BASE_ID = 'XXXXXXXX'
const AIRTABLE_BASE_NAME = 'XXXXXXXX'

// Update to match the fields of your base:
type Entry = {
  Name: string
  Notes: string
  Assignee: Collaborator
  Status: string
}

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
})

const datasets = Airtable.base(AIRTABLE_BASE_ID)(AIRTABLE_BASE_NAME)

export const update = (id: string) => (entry: Partial<Entry>) =>
  new Promise<Record<FieldSet> | undefined>((resolve, reject) =>
    datasets.update(id, entry, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  )

export const log = (entry: Partial<Entry>) => {
  return new Promise<{
    update: (entry: Partial<Entry>) => Promise<Record<FieldSet> | undefined>
    airtable_record_id: string
  }>((resolve, reject) => {
    datasets.create(entry, (err, record) => {
      if (err || !record) {
        reject(err)
        return
      }
      let airtable_record_id = record.getId()
      resolve({ update: update(airtable_record_id), airtable_record_id })
    })
  })
}
