import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';
import { ThinqConstruct } from './thinq';

export class HomeManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ThinqConstruct(this, 'thinq');

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/HomeManagementStack/thinq/ThinqHandler/ServiceRole/Resource',
      [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'Managed policy is an acceptable risk for this activity.'
        }
      ]
    )
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/HomeManagementStack/thinq/ThinqHandler/ServiceRole/DefaultPolicy/Resource',
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Wildcard is required to allow IoT actions.'
        }
      ]
    )
  }
}
