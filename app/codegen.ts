import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  config: {
    babel: "./codegen.babelrc",
  },
  schema: "schema.graphql",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },
};

export default config;
