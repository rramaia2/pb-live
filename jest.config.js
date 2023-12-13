// jest.config.js

module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
      "\\.(css|less)$": "<rootDir>/module.js", // Replace with the correct path
    },
  };