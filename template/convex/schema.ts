import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  // Add your custom tables here
  // Example: bookings, products, orders, etc.
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
},
{
  // Extend the users table with custom fields
  schemaValidation: false,
});
