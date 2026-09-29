const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFiles: ["<rootDir>/src/tests/setup.ts"],

  // Coverage
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/tests/**",
    "!src/index.ts"
  ],
  coverageThreshold: {
    global: { statements: 80 }
  }
};