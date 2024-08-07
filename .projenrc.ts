import { JsonPatch, cdk } from 'projen';
import { Stability } from 'projen/lib/cdk';
import { TrailingComma } from 'projen/lib/javascript';
import { bump } from './projenrc';

export const project = new cdk.JsiiProject({
  author: 'Amazon Web Services',
  authorAddress: '',
  authorOrganization: true,
  authorUrl: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation'],
    secret: 'GITHUB_TOKEN',
  },
  name: '@aws-cdk/cloud-assembly-schema',
  projenrcTs: true,
  docgen: false,
  stability: Stability.STABLE,
  releaseWorkflowSetupSteps: [
    {
      name: 'Pre-Release Setup',
      run: 'npx projen pre-release',
    },
  ],
  jsiiVersion: '*',
  keywords: ['aws', 'cdk'],
  repositoryUrl: 'https://github.com/cdklabs/cloud-assembly-schema.git',
  homepage: 'https://github.com/cdklabs/cloud-assembly-schema',
  minNodeVersion: '18.18.0',
  excludeTypescript: ['**/test/**/*.ts'],
  publishToMaven: {
    javaPackage: 'software.amazon.awscdk.cloudassembly.schema',
    mavenArtifactId: 'cdk-cloud-assembly-schema',
    mavenGroupId: 'software.amazon.awscdk',
  },
  publishToNuget: {
    dotNetNamespace: 'Amazon.CDK.CloudAssembly.Schema',
    packageId: 'Amazon.CDK.CloudAssembly.Schema',
    iconUrl: 'https://raw.githubusercontent.com/aws/aws-cdk/main/logo/default-256-dark.png',
  },
  publishToPypi: {
    distName: 'aws-cdk.cloud-assembly-schema',
    module: 'aws_cdk.cloud_assembly_schema',
  },
  publishToGo: {
    moduleName: 'github.com/aws/aws-cdk-go/awscdk/cloudassemblyschema',
  },
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
      trailingComma: TrailingComma.ES5,
      printWidth: 100,
    },
  },
  eslintOptions: {
    prettier: true,
    dirs: ['lib'],
    devdirs: ['test'],
  },
  jestOptions: {
    jestConfig: {
      verbose: true,
      maxWorkers: '50%',
    },
    configFilePath: 'jest.config.json',
    jestVersion: '29',
  },
  srcdir: 'lib',
  bundledDeps: ['jsonschema', 'semver'],
  description: 'Cloud Assembly Schema',
  devDeps: ['@types/semver', 'mock-fs', 'typescript-json-schema'],
  gitignore: ['.DS_Store', '**/*.d.ts', '**/*.js'],
  minMajorVersion: bump(),
});

project.addScripts({
  'update-schema': 'ts-node --prefer-ts-exts -e "require(\'./projenrc/update.ts\').update()"',
});

project.preCompileTask.exec('yarn update-schema');
project.addTask('pre-release', {
  steps: [
    {
      exec: 'yarn update-schema',
    },
    {
      exec: 'yarn default',
    },
  ],
});

project.tasks
  .tryFind('release')
  ?.updateStep(4, { exec: "git diff --ignore-space-at-eol ':!.projen/tasks.json'" });

project.tasks.tryFind('release')?.exec('git restore .projen/tasks.json');

const packageJson = project.tryFindObjectFile('package.json');
packageJson?.patch(
  JsonPatch.add('/jsii/targets/python/classifiers', [
    'Framework :: AWS CDK',
    'Framework :: AWS CDK :: 2',
  ])
);

project.addPackageIgnore('*.ts');
project.addPackageIgnore('!*.d.ts');
project.addPackageIgnore('**/scripts');

project.synth();
