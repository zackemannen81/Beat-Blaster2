import { balanceSchema } from '../src/schemas/balance';
import { tracksSchema } from '../src/schemas/tracks';
import balanceData from '../src/config/balance.json';
import tracksData from '../src/config/tracks.json';
import { z } from 'zod';

const validate = <T extends z.ZodTypeAny>(
  schemaName: string,
  schema: T,
  data: unknown
): boolean => {
  try {
    schema.parse(data);
    console.log(`✅ ${schemaName} is valid.`);
    return true;
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(`❌ ${schemaName} is invalid:`);
      console.error(e.errors);
    } else {
      console.error(`❌ Unexpected error validating ${schemaName}:`, e);
    }
    return false;
  }
};

const main = () => {
  console.log('Validating config files...');
  const results = [
    validate('balance.json', balanceSchema, balanceData),
    validate('tracks.json', tracksSchema, tracksData),
  ];

  if (results.some((r) => !r)) {
    console.error('❌ Config validation failed.');
    process.exit(1);
  } else {
    console.log('✅ All config files are valid.');
  }
};

main();
