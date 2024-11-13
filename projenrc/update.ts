import { SCHEMAS } from './schema-definition';
import { generateSchema } from './update-schema';

function update() {
  for (const s of SCHEMAS) {
    generateSchema(s);
  }
}

update();
