const dotenv = require("dotenv");
dotenv.config({path: process.env.VITE_NODE_ENV === "production" ? ".env.production" : ".env" });

