import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Hisab API",
      version: "1.0.0",
      description:
        "Automated Tiffin Management System - API for groups, daily tiffin selection, hisab (billing) and payments.",
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        TiffinType: {
          type: "string",
          enum: ["FULL", "HALF", "NONE"],
        },
        GroupRole: {
          type: "string",
          enum: ["ADMIN", "MEMBER"],
        },
        GroupStatus: {
          type: "string",
          enum: ["ACTIVE", "UPCOMING", "EXPIRED", "CLOSED"],
        },
        PaymentStatus: {
          type: "string",
          enum: ["PAID", "PARTIALLY_PAID", "PENDING"],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            preferredLanguage: { type: "string", enum: ["en", "mr"] },
            profileImage: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/docs/*.ts"],
});
