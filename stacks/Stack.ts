import {
  StackContext,
  Api,
  StaticSite,
  Bucket,
} from '@serverless-stack/resources'
import * as cdk from 'aws-cdk-lib'
import { BatchConstruct } from './BatchConstruct'

export function Stack({ stack }: StackContext) {
  // S3
  const bucket = new Bucket(stack, 'datasets', {
    cdk: { bucket: { publicReadAccess: true } },
  })

  // BATCH
  const batch = new BatchConstruct(stack, 'batch', {
    dockerDir: './../',
    environment: { BUCKET_NAME: bucket.bucketName },
  })

  const role = new cdk.aws_iam.Role(stack, 'lambda-function-role', {
    assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSBatchFullAccess'),
      {
        managedPolicyArn:
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      },
    ],
  })

  // PUBLIC LAMBDA
  const api = new Api(stack, 'api', {
    routes: {
      'POST /': {
        type: 'function',
        function: {
          role: role,
          handler: 'handlers/lambda.handler',
          environment: {
            BUCKET_NAME: bucket.bucketName,
            BATCH_JOB_QUEUE: batch.jobQueueName,
            BATCH_JOB_DEFINITION: batch.jobDefinitionName,
          },
          timeout: '15 minutes',
          permissions: [bucket],
        },
      },
    },
  })

  api.attachPermissions([bucket])

  // STATIC SITE
  const site = new StaticSite(stack, 'client', {
    path: 'client',
    buildCommand: 'yarn build',
    environment: { VITE_API_URL: api.url },
    buildOutput: 'dist',
  })

  stack.addOutputs({
    ApiEndpoint: api.url,
    WebEndpoint: site.url,
  })
}
