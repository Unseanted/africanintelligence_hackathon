// swaggerOptions.js (or directly in app.js)
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
        url: "http://localhost:8080",
        description: "Development server",
      },
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
      schemas: {
        Badge: {
          type: "object",
          required: ["title", "description", "imageUrl", "category", "criteria", "user_id", "awardedBy"],
          properties: {
            title: {
              type: "string",
              description: "Title of the badge"
            },
            description: {
              type: "string",
              description: "Description of the badge"
            },
            imageUrl: {
              type: "string",
              description: "URL of the badge image"
            },
            category: {
              type: "string",
              enum: ["achievement", "participation", "excellence", "milestone", "special"],
              description: "Category of the badge"
            },
            criteria: {
              type: "string",
              description: "Criteria for earning the badge"
            },
            points: {
              type: "number",
              description: "Points awarded with this badge"
            },
            user_id: {
              type: "string",
              description: "ID of the user who earned the badge"
            },
            awardedBy: {
              type: "string",
              description: "ID of the admin who awarded the badge"
            },
            status: {
              type: "string",
              enum: ["active", "revoked", "pending"],
              description: "Current status of the badge"
            },
            expiryDate: {
              type: "string",
              format: "date-time",
              description: "Expiration date of the badge (optional)"
            }
          }
        }
      },
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  // This tells swagger-jsdoc where to look for your API documentation comments.
  apis: ["./routes/*.js"],
};

module.exports = swaggerOptions;
