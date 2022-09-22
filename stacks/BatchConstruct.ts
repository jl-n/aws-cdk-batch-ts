import path from 'path'

import batch from '@aws-cdk/aws-batch-alpha'
import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'

export class BatchConstruct extends Construct {
  readonly jobDefinitionName: string
  readonly jobQueueName: string
  readonly computeEnvironmentName: string
  readonly environment: Record<string, string>

  /**
   *
   * @param scope Construct
   * @param id string
   * @param params {
   *    dockerDir: string //Relative path to the Dockerfile from the project root
   *    environment: Record<string, string> //environment variables
   * }
   */
  constructor(
    scope: Construct,
    id: string,
    params: {
      dockerDir: string // dockerDir: Relative path to the source code for the aws batch job, from the project root
      environment: Record<string, string>
    }
  ) {
    super(scope, id)
    this.environment = params.environment

    const vpc = new cdk.aws_ec2.Vpc(scope, 'batch-job-vpc', { maxAzs: 2 })
    const sg = new cdk.aws_ec2.SecurityGroup(scope, 'security-group', { vpc })

    const docker_image_asset = new cdk.aws_ecr_assets.DockerImageAsset(
      scope,
      'docker-image-asset',
      { directory: path.join('__dirname', params.dockerDir) }
    )

    const docker_container_image =
      cdk.aws_ecs.ContainerImage.fromDockerImageAsset(docker_image_asset)

    const executionRole = new cdk.aws_iam.Role(scope, 'execution-role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonS3FullAccess'
        ),
      ],
    })

    const jobRole = new cdk.aws_iam.Role(scope, 'job-role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonS3FullAccess'
        ),
      ],
    })

    const jobDefinition = new batch.JobDefinition(scope, 'job-definition', {
      parameters: { params: 'default-params-from-job-definition' },
      platformCapabilities: [batch.PlatformCapabilities.FARGATE],
      container: {
        jobRole,
        secrets: {},
        executionRole,
        environment: params.environment,
        // Must be a valid combination:
        // https://docs.aws.amazon.com/batch/latest/userguide/job_definition_parameters.html#ContainerProperties-resourceRequirements-Fargate-memory-vcpu
        vcpus: 2,
        memoryLimitMiB: 4096,
        // -----------------------------
        assignPublicIp: true,
        command: ['yarn', 'start', '--params', 'Ref::params'],
        image: docker_container_image,
      },
    })

    const computeEnvironment = new batch.ComputeEnvironment(
      scope,
      'batch-compute-environment',
      {
        computeResources: {
          vpc,
          maxvCpus: 32,
          securityGroups: [sg],
          type: batch.ComputeResourceType.FARGATE,
        },
      }
    )

    const jobQueue = new batch.JobQueue(scope, 'job-queue', {
      computeEnvironments: [
        { computeEnvironment: computeEnvironment, order: 1 },
      ],
    })

    this.jobDefinitionName = jobDefinition.jobDefinitionName
    this.jobQueueName = jobQueue.jobQueueName
    this.computeEnvironmentName = computeEnvironment.computeEnvironmentName
  }
}
