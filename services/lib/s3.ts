import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let s3 = null as S3Client | null

export const upload = async (filename: string, contents: string) => {
  if (!s3) s3 = new S3Client({ region: 'us-east-1' })
  const BUCKET_NAME = process.env.BUCKET_NAME

  if (!BUCKET_NAME) {
    console.error('No process.env.BUCKET_NAME found, returning...')
    return
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: contents,
  }

  console.log('Uploading files to the bucket')
  return s3.send(new PutObjectCommand(params)).then((data) => {
    console.log(data)
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
  })
}
