import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "PERN advanced eCommerce",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["backend/docs/*.js"],
};

const specs = swaggerJSDoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
};
