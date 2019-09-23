module.exports = {
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/bundle/',
    '/var/'
  ],
  modulePaths: [
    '.'
  ],
  collectCoverage: true,
  coverageDirectory: './var/cover/',
  coverageReporters: ['html']
};
