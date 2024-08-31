import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import { ArtifactType, AssemblyManifest, Manifest, StackTagsMetadataEntry } from '../lib';

const FIXTURES = path.join(__dirname, 'fixtures');

function fixture(name: string) {
  return path.join(FIXTURES, name, 'manifest.json');
}

test('manifest save', () => {
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-tests'));
  const manifestFile = path.join(outdir, 'manifest.json');

  const assemblyManifest: AssemblyManifest = {
    version: 'version',
    runtime: {
      libraries: { lib1: '1.2.3' },
    },
  };

  Manifest.saveAssemblyManifest(assemblyManifest, manifestFile);

  const saved = JSON.parse(fs.readFileSync(manifestFile, { encoding: 'utf-8' }));

  expect(saved).toEqual({
    ...assemblyManifest,
    version: Manifest.version(), // version is forced
  });
});

test('manifest save fails when assumeRoleAdditionalOptions.RoleArn is used in deploy role', () => {
  const assemblyManifest: AssemblyManifest = {
    version: 'version',
    artifacts: {
      'aws-cdk-sqs': {
        type: ArtifactType.AWS_CLOUDFORMATION_STACK,
        environment: 'aws://unknown-account/unknown-region',
        properties: {
          templateFile: 'aws-cdk-sqs.template.json',
          validateOnSynth: false,
          assumeRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}',
          assumeRoleAdditionalOptions: {
            RoleArn: 'some-role-arn',
          },
          cloudFormationExecutionRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}',
          stackTemplateAssetObjectUrl:
            's3://cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/7fd5f7d37f2f344aa43e18636af702436c91c871b1380d772857c431c603bb27.json',
          requiresBootstrapStackVersion: 6,
          bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
        },
        displayName: 'aws-cdk-sqs',
      },
    },
  };

  expect(() => Manifest.saveAssemblyManifest(assemblyManifest, 'some-path')).toThrow(
    /RoleArn is not allowed inside 'artifacts.aws-cdk-sqs.properties.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.assumeRoleArn' instead./
  );
});

test('manifest save fails when assumeRoleAdditionalOptions.ExternalId is used in deploy role', () => {
  const assemblyManifest: AssemblyManifest = {
    version: 'version',
    artifacts: {
      'aws-cdk-sqs': {
        type: ArtifactType.AWS_CLOUDFORMATION_STACK,
        environment: 'aws://unknown-account/unknown-region',
        properties: {
          templateFile: 'aws-cdk-sqs.template.json',
          validateOnSynth: false,
          assumeRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}',
          assumeRoleAdditionalOptions: {
            ExternalId: 'some-role-arn',
          },
          cloudFormationExecutionRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}',
          stackTemplateAssetObjectUrl:
            's3://cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/7fd5f7d37f2f344aa43e18636af702436c91c871b1380d772857c431c603bb27.json',
          requiresBootstrapStackVersion: 6,
          bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
        },
        displayName: 'aws-cdk-sqs',
      },
    },
  };

  expect(() => Manifest.saveAssemblyManifest(assemblyManifest, 'some-path')).toThrow(
    /ExternalId is not allowed inside 'artifacts.aws-cdk-sqs.properties.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.assumeRoleExternalId' instead./
  );
});

test('manifest save fails when assumeRoleAdditionalOptions.RoleArn is used in lookup role', () => {
  const assemblyManifest: AssemblyManifest = {
    version: 'version',
    artifacts: {
      'aws-cdk-sqs': {
        type: ArtifactType.AWS_CLOUDFORMATION_STACK,
        environment: 'aws://unknown-account/unknown-region',
        properties: {
          templateFile: 'aws-cdk-sqs.template.json',
          validateOnSynth: false,
          assumeRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}',
          cloudFormationExecutionRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}',
          stackTemplateAssetObjectUrl:
            's3://cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/7fd5f7d37f2f344aa43e18636af702436c91c871b1380d772857c431c603bb27.json',
          requiresBootstrapStackVersion: 6,
          bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
          lookupRole: {
            arn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}',
            requiresBootstrapStackVersion: 8,
            bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
            assumeRoleAdditionalOptions: {
              RoleArn: 'some-role-arn',
            },
          },
        },
        displayName: 'aws-cdk-sqs',
      },
    },
  };

  expect(() => Manifest.saveAssemblyManifest(assemblyManifest, 'some-path')).toThrow(
    /RoleArn is not allowed inside 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.lookupRole.arn' instead./
  );
});

test('manifest save fails when assumeRoleAdditionalOptions.ExternalId is used in lookup role', () => {
  const assemblyManifest: AssemblyManifest = {
    version: 'version',
    artifacts: {
      'aws-cdk-sqs': {
        type: ArtifactType.AWS_CLOUDFORMATION_STACK,
        environment: 'aws://unknown-account/unknown-region',
        properties: {
          templateFile: 'aws-cdk-sqs.template.json',
          validateOnSynth: false,
          assumeRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}',
          cloudFormationExecutionRoleArn:
            'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}',
          stackTemplateAssetObjectUrl:
            's3://cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/7fd5f7d37f2f344aa43e18636af702436c91c871b1380d772857c431c603bb27.json',
          requiresBootstrapStackVersion: 6,
          bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
          lookupRole: {
            arn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}',
            requiresBootstrapStackVersion: 8,
            bootstrapStackVersionSsmParameter: '/cdk-bootstrap/hnb659fds/version',
            assumeRoleAdditionalOptions: {
              ExternalId: 'some-role-arn',
            },
          },
        },
        displayName: 'aws-cdk-sqs',
      },
    },
  };

  expect(() => Manifest.saveAssemblyManifest(assemblyManifest, 'some-path')).toThrow(
    /ExternalId is not allowed inside 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleExternalId' instead./
  );
});

test('manifest load', () => {
  const loaded = Manifest.loadAssemblyManifest(fixture('only-version'));
  expect(loaded).toMatchSnapshot();
});

test('manifest load fails for invalid nested property', () => {
  expect(() => Manifest.loadAssemblyManifest(fixture('invalid-nested-property'))).toThrow(
    /Invalid assembly manifest/
  );
});

test('manifest load fails for invalid artifact type', () => {
  expect(() => Manifest.loadAssemblyManifest(fixture('invalid-artifact-type'))).toThrow(
    /Invalid assembly manifest/
  );
});

test('manifest load fails on higher major version', () => {
  expect(() => Manifest.loadAssemblyManifest(fixture('high-version'))).toThrow(
    /Cloud assembly schema version mismatch/
  );
});

test('manifest load fails when assumeRoleAdditionalOptions.RoleArn is used in deploy role', () => {
  expect(() =>
    Manifest.loadAssemblyManifest(fixture('StackProperties.assumeRoleAdditionalOptions.RoleArn'))
  ).toThrow(
    /RoleArn is not allowed inside 'artifacts.aws-cdk-sqs.properties.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.assumeRoleArn' instead./
  );
});

test('manifest load fails when assumeRoleAdditionalOptions.ExternalId is used in deploy role', () => {
  expect(() =>
    Manifest.loadAssemblyManifest(fixture('StackProperties.assumeRoleAdditionalOptions.ExternalId'))
  ).toThrow(
    /ExternalId is not allowed inside 'artifacts.aws-cdk-sqs.properties.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.assumeRoleExternalId' instead./
  );
});

test('manifest load fails when assumeRoleAdditionalOptions.RoleArn is used in bootstrap role', () => {
  expect(() =>
    Manifest.loadAssemblyManifest(
      fixture('StackProperties.BootstrapRole.assumeRoleAdditionalOptions.RoleArn')
    )
  ).toThrow(
    /RoleArn is not allowed inside 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.lookupRole.arn' instead./
  );
});

test('manifest load fails when assumeRoleAdditionalOptions.ExternalId is used in bootstrap role', () => {
  expect(() =>
    Manifest.loadAssemblyManifest(
      fixture('StackProperties.BootstrapRole.assumeRoleAdditionalOptions.ExternalId')
    )
  ).toThrow(
    /ExternalId is not allowed inside 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleAdditionalOptions'. Use 'artifacts.aws-cdk-sqs.properties.lookupRole.assumeRoleExternalId' instead./
  );
});

// once we start introducing minor version bumps that are considered
// non breaking, this test can be removed.
test('manifest load succeeds on higher minor version', () => {
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-tests'));
  const manifestFile = path.join(outdir, 'manifest.json');

  const newVersion = semver.inc(Manifest.version(), 'minor');
  expect(newVersion).toBeTruthy();

  if (newVersion) {
    const assemblyManifest: AssemblyManifest = {
      version: newVersion,
    };

    // can't use saveAssemblyManifest because it will force the correct version
    fs.writeFileSync(manifestFile, JSON.stringify(assemblyManifest));

    expect(() => Manifest.loadAssemblyManifest(manifestFile)).not.toThrow(
      /Cloud assembly schema version mismatch/
    );
  }
});

test('manifest load succeeds on higher patch version', () => {
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-tests'));
  const manifestFile = path.join(outdir, 'manifest.json');

  const newVersion = semver.inc(Manifest.version(), 'patch');
  expect(newVersion).toBeTruthy();

  if (newVersion) {
    const assemblyManifest: AssemblyManifest = {
      version: newVersion,
    };

    // can't use saveAssemblyManifest because it will force the correct version
    fs.writeFileSync(manifestFile, JSON.stringify(assemblyManifest));

    expect(() => Manifest.loadAssemblyManifest(manifestFile)).not.toThrow(
      /Cloud assembly schema version mismatch/
    );
  }
});

test('manifest load does not fail if version checking is disabled, and unknown properties are added', () => {
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-tests'));
  const manifestFile = path.join(outdir, 'manifest.json');
  const newVersion = semver.inc(Manifest.version(), 'major');
  expect(newVersion).toBeTruthy();

  const assemblyManifest: AssemblyManifest = {
    version: newVersion!,
    artifacts: {
      SomeArtifact: {
        type: 'aws:cloudformation:stack',
        thisPropertyWillNeverBeInTheManifest: 'i_hope',
      } as any,
      UnknownArtifact: {
        type: 'unknown-artifact-type',
      } as any,
    },
  };

  // can't use saveAssemblyManifest because it will force the correct version
  fs.writeFileSync(manifestFile, JSON.stringify(assemblyManifest));

  Manifest.loadAssemblyManifest(manifestFile, { skipVersionCheck: true, skipEnumCheck: true });
});

test('manifest load fails on invalid version', () => {
  expect(() => Manifest.loadAssemblyManifest(fixture('invalid-version'))).toThrow(
    /Invalid semver string/
  );
});

test('manifest load succeeds on unknown properties', () => {
  const manifest = Manifest.loadAssemblyManifest(fixture('unknown-property'));
  expect(manifest.version).toEqual('0.0.0');
});

test('stack-tags are deserialized properly', () => {
  const m: AssemblyManifest = Manifest.loadAssemblyManifest(fixture('with-stack-tags'));

  if (m.artifacts?.stack?.metadata?.AwsCdkPlaygroundBatch[0].data) {
    const entry = m.artifacts.stack.metadata.AwsCdkPlaygroundBatch[0]
      .data as StackTagsMetadataEntry;
    expect(entry[0].key).toEqual('hello');
    expect(entry[0].value).toEqual('world');
  }
  expect(m.version).toEqual('0.0.0');
});

test('can access random metadata', () => {
  const loaded = Manifest.loadAssemblyManifest(fixture('random-metadata'));
  const randomArray = loaded.artifacts?.stack.metadata?.AwsCdkPlaygroundBatch[0].data;
  const randomNumber = loaded.artifacts?.stack.metadata?.AwsCdkPlaygroundBatch[1].data;
  const randomMap = loaded.artifacts?.stack.metadata?.AwsCdkPlaygroundBatch[2].data;

  expect(randomArray).toEqual(['42']);
  expect(randomNumber).toEqual(42);
  expect(randomMap).toEqual({
    key: 'value',
  });

  expect(randomMap).toBeTruthy();

  if (randomMap) {
    expect((randomMap as any).key).toEqual('value');
  }
});
