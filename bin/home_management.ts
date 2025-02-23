#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { HomeManagementStack } from '../lib/home_management_stack';

const app = new cdk.App();
new HomeManagementStack(app, 'HomeManagementStack', {});
cdk.Aspects.of(app).add(new AwsSolutionsChecks());
