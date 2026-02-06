import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import * as authSchema from "@/db/auth-schema";
import { db } from "@/db/client";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.authUser,
      session: authSchema.authSession,
      account: authSchema.authAccount,
      verification: authSchema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false, // Don't allow users to set this during signup
      },
    },
  },
  plugins: [
    admin({
      adminUserIds: [], // We'll use roles instead
      defaultRole: "buyer",
    }),
    nextCookies(), // auto set cookies in server actions
  ],
});
