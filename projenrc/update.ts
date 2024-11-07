import { SCHEMAS } from './schema-definition';
import { generateSchema } from './update-schema';
import { maybeBumpVersion } from './versioning';

export function update() {
  const schemas: Record<string, any> = {};
  for (const s of SCHEMAS) {
    schemas[s] = generateSchema(s);
  }
  maybeBumpVersion(schemas);
}
