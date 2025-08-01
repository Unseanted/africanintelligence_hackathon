// swaggerOptions.js (or directly in app.js)

const { port } = require('./configs/config.js'); // Ensure PORT is defined
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Specify the OpenAPI version
    info: {
      title: "LMS API Documentation",
      version: "1.0.0",
      description: "API documentation for the Learning Management System",
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: "Development server",
      },
      {
      	url: `https://africanintelligence-hackathon-backend.onrender.com/api`,
      	description: "Swagger in prod"
      }
      // You can add more server URLs for production, staging, etc.
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  // This tells swagger-jsdoc where to look for your API documentation comments.
  apis: ["./routes/*.js", "./server.js"],
};

module.exports = swaggerOptions;
