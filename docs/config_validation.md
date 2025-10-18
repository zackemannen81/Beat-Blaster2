# Config File Validation

To ensure the integrity of the game's configuration files, we use `zod` to validate their structure.

## Schemas

The schemas for the configuration files are located in the `src/schemas` directory. Each schema is a TypeScript file that exports a `zod` schema.

## Validation Script

The validation script is located at `scripts/validate-config.ts`. It imports the schemas and the config files, and then uses `zod` to validate them.

## Running Validation

You can run the validation script manually by running the following command:

```bash
pnpm run validate-config
```

The validation script is also integrated into the `build` and `test` processes, so it will be run automatically when you build or test the game. If any of the config files are invalid, the build or test will fail.
