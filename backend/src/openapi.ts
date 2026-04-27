import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Soroban Loyalty API",
      version: "1.0.0",
      description: "API for the Soroban Loyalty platform, allowing merchants to manage campaigns and users to track rewards on the Stellar network.",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "API Support",
        url: "https://github.com/Dev-Odun-oss/Soroban-Loyalty",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from POST /auth/verify",
        },
      },
      schemas: {
        Campaign: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            merchant: { type: "string", example: "GD...123" },
            reward_amount: { type: "integer", example: 500 },
            expiration: { type: "integer", example: 1714172400 },
            active: { type: "boolean", example: true },
            total_claimed: { type: "integer", example: 10 },
            display_order: { type: "integer", example: 0 },
            tx_hash: { type: "string", nullable: true, example: "abcdef..." },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Reward: {
          type: "object",
          properties: {
            id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
            user_address: { type: "string", example: "GC...456" },
            campaign_id: { type: "integer", example: 1 },
            amount: { type: "integer", example: 500 },
            redeemed: { type: "boolean", example: false },
            redeemed_amount: { type: "integer", example: 0 },
            claimed_at: { type: "string", format: "date-time" },
            redeemed_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        AnalyticsData: {
          type: "object",
          properties: {
            totalClaims: { type: "integer", example: 150 },
            totalLYT: { type: "number", example: 75000.5 },
            redemptionRate: { type: "integer", example: 45 },
            claimsPerCampaign: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "#1" },
                  claims: { type: "integer", example: 50 },
                },
              },
            },
            claimsOverTime: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date", example: "2024-04-26" },
                  claims: { type: "integer", example: 12 },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/index.ts"],
};

export const openApiSpec = swaggerJsdoc(options);
