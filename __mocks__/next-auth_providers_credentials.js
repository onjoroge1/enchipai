const Credentials = jest.fn((config) => ({
  id: 'credentials',
  name: 'Credentials',
  type: 'credentials',
  ...config,
}));

module.exports = Credentials;
module.exports.default = Credentials;
module.exports.Credentials = Credentials;
module.exports.CredentialsProvider = jest.fn();

