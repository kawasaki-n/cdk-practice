import * as cdk from "@aws-cdk/core";
import {
  CfnEC2Fleet,
  CfnSubnet,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "@aws-cdk/aws-ec2";

export class Cdk01Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new Vpc(this, "VpcForCdk", {
      cidr: "10.0.0.0/16",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnetForCdk",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "PrivateSubnetForCdk",
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });

    const sg = new SecurityGroup(this, "SecurityGroupForCdk", {
      vpc: vpc,
      securityGroupName: "SecurityGroupForCdk",
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

    const instance = new Instance(this, "WebServerForCdk", {
      machineImage: MachineImage.latestAmazonLinux(),
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      vpc: vpc,
      securityGroup: sg,
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      keyName: "cdk-test",
    });

    const dbSg = new SecurityGroup(this, "SecurityGroupDBForCdk", {
      vpc: vpc,
      securityGroupName: "SecurityGroupDBForCdk",
    });
    dbSg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    dbSg.addIngressRule(Peer.anyIpv4(), Port.tcp(3306));
    dbSg.addIngressRule(Peer.anyIpv4(), Port.allIcmp());

    const db = new Instance(this, "DbServerForCdk", {
      machineImage: MachineImage.latestAmazonLinux(),
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      vpc: vpc,
      securityGroup: dbSg,
      keyName: "cdk-test",
    });
  }
}
