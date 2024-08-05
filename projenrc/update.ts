import { SCHEMAS } from './schema-definition';
import { generateSchema } from './update-schema';

export function update() {
  for (const s of SCHEMAS) {
    generateSchema(s);
  }
}
