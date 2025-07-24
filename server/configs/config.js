const dotenv = require("dotenv");
dotenv.config({path: process.env.NODE_ENV === "production" ? ".env.production" : ".env" });

const mongo_user = process.env.MONGO_USER;
const mongo_pass = process.env.MONGO_PASS;
const mongo_uri = process.env.MONGO_URI;
const mongo_uri2 = process.env.MONGO_URI2;
const email_user = process.env.EMAIL_USER;
const email_pass = process.env.EMAIL_PASS;
const vapid_public_key = process.env.VAPID_PUBLIC_KEY;
const vapid_private_key = process.env.VAPID_PRIVATE_KEY;
const clientID = process.env.CLIENT_ID;
const port = process.env.PORT;
const mistral_api_key = process.env.MISTRAL_API_KEY;
const groq_api_key = process.env.GROQ_API_KEY;
const jwt_secret = process.env.JWT_SECRET;

module.exports = {
  mongo_uri2,
  mongo_pass,
  mongo_uri,
  mongo_user,
  email_user,
  email_pass,
  vapid_private_key,
  vapid_public_key,
  clientID,
  port,
  mistral_api_key,
  groq_api_key,
  jwt_secret,
  email_user,
  email_pass,
  isProduction: process.env.NODE_ENV === "production",
};
