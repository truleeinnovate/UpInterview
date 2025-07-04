module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/__tests__'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};