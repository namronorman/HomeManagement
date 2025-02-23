import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as events_targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as systemsmanager from 'aws-cdk-lib/aws-ssm';
import { NagSuppressions } from 'cdk-nag';
import * as path from 'path';

export class ThinqConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const secrets_values = require('../.secrets.json');
    const secret = new secretsmanager.Secret(this, 'thinqSecret', {
      secretObjectValue: {
        'accessToken': cdk.SecretValue.unsafePlainText(secrets_values.thinq.accessToken),
        'clientId': cdk.SecretValue.unsafePlainText(secrets_values.thinq.clientId),
      },
      secretName: 'thinq'
    });
    NagSuppressions.addResourceSuppressions(secret, [
      {
        id: 'AwsSolutions-SMG4',
        reason: 'Rotation is handled outside of AWS.'
      }
    ]);

    // Parameter store value for the secret ARN
    new systemsmanager.StringParameter(this, 'thinqSecretArn', {
      parameterName: '/thinq/discord-webhook',
      stringValue: secrets_values.discordWebhook,
    });

    // DynamoDB table to store the current state of the devices
    const table = new dynamodb.Table(this, 'thinqTable', {
      partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.DEFAULT,
      pointInTimeRecovery: false, // This will later be pointInTimeRecoverySpecification but is not availble in the current version.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    NagSuppressions.addResourceSuppressions(table, [
      {
        id: 'AwsSolutions-DDB3',
        reason: 'Point in time recovery is as this table is used for current state only.'
      }
    ]);

    const thinqLambda = new lambda.DockerImageFunction(this, "ThinqHandler", {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30),
      environment: {
        THINQ_SECRET_ID: secret.secretName,
        THINQ_TABLE_NAME: table.tableName,
        PARAMETER_STORE_NAME: '/thinq/discord-webhook',
      },
    });
    secret.grantRead(thinqLambda);
    table.grantReadWriteData(thinqLambda);
    
    const rule = new events.Rule(this, 'thinqRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
    });
    rule.addTarget(new events_targets.LambdaFunction(thinqLambda));
  }
}
