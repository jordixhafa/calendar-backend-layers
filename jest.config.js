/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: '@oaklean/profiler-jest-environment/env.js', // updated
  globalSetup: '@oaklean/profiler-jest-environment/setup.js',   // added
  globalTeardown: '@oaklean/profiler-jest-environment/teardown.js', // added
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/tests'],
  verbose: true
};
