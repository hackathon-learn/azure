const dotenv = require('dotenv');

module.exports = () => {
  const environment = process.env.NODE_ENV || 'development';
  const envFilePath = "./config/env/.env.production";

  const result = dotenv.config({ path: envFilePath });

  if (result.error) {
    throw result.error;
  }


  return result.parsed;
};