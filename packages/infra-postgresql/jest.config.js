/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['dist/'],
  globals: {
    POSTGRESQL_TEST_DB_CONNECTION_STRING:
      'postgres://admin:admin@localhost:5434/shopping-event-store-test',
  },
}
