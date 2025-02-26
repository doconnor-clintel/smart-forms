import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { HapiEndpoint } from 'ehr-proxy-hapi-endpoint';
import { SmartProxy } from 'ehr-proxy-smart-proxy';

export class EhrProxyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC and cluster that will be used to run the service.
    const vpc = new Vpc(this, 'EhrProxyVpc', { maxAzs: 2 });
    const cluster = new Cluster(this, 'EhrProxyCluster', { vpc: vpc });

    // Create a load balancer that will be used to route traffic to the services.
    const lb = new ApplicationLoadBalancer(this, 'EhrProxyLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'EhrProxyHostedZone', {
      hostedZoneId: 'Z0507963281Q0BWHKV1OD',
      zoneName: 'smartforms.io'
    });

    const certificate = new Certificate(this, 'EhrProxyCertificate', {
      domainName: 'proxy.smartforms.io',
      validation: CertificateValidation.fromDns(hostedZone)
    });

    new ARecord(this, 'EhrProxyAliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(lb)),
      recordName: 'proxy.smartforms.io'
    });

    const listener = lb.addListener('EhrProxyListener', {
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [certificate]
    });

    const hapi = new HapiEndpoint(this, 'EhrProxyHapi', { cluster });
    const smartProxy = new SmartProxy(this, 'EhrProxySmartProxy', { cluster });

    // Create a target for the HAPI FHIR API service
    const hapiTarget = hapi.service.loadBalancerTarget({
      containerName: hapi.containerName,
      containerPort: hapi.containerPort
    });
    const hapiTargetGroup = new ApplicationTargetGroup(this, 'EhrProxyHapiTargetGroup', {
      vpc,
      port: smartProxy.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [hapiTarget],
      healthCheck: { path: '/fhir/metadata' }
    });
    listener.addAction('EhrProxyHapiAction', {
      action: ListenerAction.forward([hapiTargetGroup]),
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/fhir*'])]
    });

    // Create a target for the smart proxy service
    const smartProxyTarget = smartProxy.service.loadBalancerTarget({
      containerName: smartProxy.containerName,
      containerPort: smartProxy.containerPort
    });
    const smartProxyTargetGroup = new ApplicationTargetGroup(
      this,
      'EhrProxySmartProxyTargetGroup',
      {
        vpc,
        port: smartProxy.containerPort,
        protocol: ApplicationProtocol.HTTP,
        targets: [smartProxyTarget],
        healthCheck: { path: '/v/r4/fhir/metadata' }
      }
    );
    listener.addAction('EhrProxyDefaultAction', {
      action: ListenerAction.forward([smartProxyTargetGroup])
    });
  }
}
