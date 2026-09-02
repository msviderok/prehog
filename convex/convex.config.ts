import { defineApp } from 'convex/server'
import crons from '@convex-dev/crons/convex.config'
import posthog from '@posthog/convex/convex.config.js'
import { v } from 'convex/values'

const app = defineApp({
  env: {
    POSTHOG_PROJECT_TOKEN: v.string(),
    POSTHOG_HOST: v.optional(v.string()),
    POSTHOG_PERSONAL_API_KEY: v.optional(v.string()),
    POSTHOG_FLAGS_POLLING_INTERVAL_SECONDS: v.optional(v.string()),
    CLERK_JWT_ISSUER_DOMAIN: v.optional(v.string()),
    CLERK_WEBHOOK_SECRET: v.optional(v.string()),
    TG_BOT_TOKEN: v.optional(v.string()),
    TG_BOT_CHAT_ID: v.optional(v.string()),
    ADMIN_ID: v.optional(v.string()),
  },
})

app.use(posthog, {
  env: {
    POSTHOG_PROJECT_TOKEN: app.env.POSTHOG_PROJECT_TOKEN,
    POSTHOG_HOST: app.env.POSTHOG_HOST,
    POSTHOG_PERSONAL_API_KEY: app.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_FLAGS_POLLING_INTERVAL_SECONDS: app.env.POSTHOG_FLAGS_POLLING_INTERVAL_SECONDS,
  },
})

app.use(crons)

export default app
