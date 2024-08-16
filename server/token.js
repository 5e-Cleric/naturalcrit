import jwt from 'jwt-simple';
import nconf from 'nconf';

// Load configuration values
nconf
  .argv()
  .env({ lowerCase: true }) // Load environment variables
  .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
  .file('defaults', { file: 'config/default.json' });

// Generate an Access Token for the given User ID
export const generateAccessToken = (req, res) => {
  const payload = req.user.toJSON();

  // When the token was issued
  payload.issued = new Date();
  // Which service issued the Token
  payload.issuer = nconf.get('authentication_token_issuer');
  // Which service is the token intended for
  payload.audience = nconf.get('authentication_token_audience');
  // The signing key for signing the token
  delete payload.password;
  delete payload._id;

  console.log("THE PAYLOAD");
  console.log(payload);

  const secret = nconf.get('authentication_token_secret');
  console.log("ENCODING WITH SECRET:");
  console.log(secret);

  const token = jwt.encode(payload, secret);

  return token;
};
