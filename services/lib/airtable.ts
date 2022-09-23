import Airtable, { FieldSet, Record, Collaborator, Table } from 'airtable'

// Update to match the fields of your base:
type Entry = {
  Name: string
  Notes: string
  Assignee: Collaborator
  Status: 'Todo' | 'In progress' | 'Done'
}

const env = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
  AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME || '',
}

const missing = Object.entries(env)
  .filter(([, v]) => v === '')
  .map(([k]) => k)
  .join(', ')

let table = new Proxy(() => {}, {
  get: () => table,
  apply: () => table,
}) as unknown as Table<FieldSet>

if (missing.length > 0) {
  console.error('Airtable not initialised, missing: ', missing)
} else {
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: env.AIRTABLE_API_KEY,
  })
  table = Airtable.base(env.AIRTABLE_BASE_ID)(env.AIRTABLE_TABLE_NAME)
}

export const update = (id: string) => (entry: Partial<Entry>) =>
  new Promise<Record<FieldSet> | undefined>((resolve, reject) =>
    table.update(id, entry, (err, res) => (err ? reject(err) : resolve(res)))
  )

export const log = (entry: Partial<Entry>) => {
  return new Promise<{
    update: (entry: Partial<Entry>) => Promise<Record<FieldSet> | undefined>
    airtable_record_id: string
  }>((resolve, reject) => {
    table.create(entry, (err, record) => {
      if (err || !record) {
        reject(err)
        return
      }
      let airtable_record_id = record.getId()
      resolve({ update: update(airtable_record_id), airtable_record_id })
    })
  })
}
