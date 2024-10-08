## Cloud Assembly Schema

Making changes to this module should only happen when you introduce new cloud assembly capabilities.

> For example: supporting the `--target` option when building docker containers.

If you decided these changes are necessary, simply go ahead and make the necessary modifications to
the interfaces that describe the schema. Our tests and validation mechanisms will ensure you make those
changes correctly.

### Module Structure

There are two main things to understand about the files in this module:

- [`lib/manifest.ts`](./lib/manifest.ts)

  This is the typescript code that defines our schema. It is solely comprised of structs (property only interfaces).
  It directly maps to the way we want manifest files to be stored on disk. When you want to make changes to the schema,
  this is the file you should be editing.

- [`lib/schema`](./schema/)

  This directory contains the generated json [schema](./schema/cloud-assembly.schema.json) from the aforementioned
  typescript code. It also contains a [version](./schema/cloud-assembly.version.json) file that holds the current version
  of the schema. These files are **not** intended for manual editing. Keep reading to understand how they change and when.

### Schema Generation

The schema can be generated by running `yarn update-schema`. It reads the [`manifest.ts`](./lib/manifest.ts) file and writes
an updated json schema to [`cloud-assembly.schema.json`](./schema/cloud-assembly.schema.json). This command is run as part of
the build but can also be called separately.

If changes to the code are performed, without generating a new schema, the tests will fail:

```console
$ yarn test
FAIL test/schema.test.js (5.902s)
  ✓ manifest save (7ms)
  ✕ cloud-assembly.json.schema is correct (5304ms)
  ✓ manifest load (4ms)
  ✓ manifest load fails for invalid nested property (5ms)
  ✓ manifest load fails for invalid artifact type (1ms)
  ✓ stack-tags are deserialized properly (1ms)
  ✓ can access random metadata (1ms)

  ● cloud-assembly.json.schema is correct

    Whoops, Looks like the schema has changed. Did you forget to run 'yarn update-schema'?
```

### Schema Validation

Being a **stable** `jsii` module, it undergoes strict API compatibility checks with the help
of [`jsii-diff`](https://github.com/aws/jsii/tree/master/packages/jsii-diff).
This means that breaking changes will be rejected. These include:

- Adding a required property. (same as changing from _optional_ to _required_)
- Changing the type of the property.

In addition, the interfaces defined here are programmatically exposed to users, via the `manifest`
property of the [`CloudAssembly`](../cx-api/lib/cloud-assembly.ts) class. This means that the following are
also considered breaking changes:

- Changing a property from _required_ to _optional_.
- Removing an optional property.
- Removing a required property.
