import { type AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      // @ts-ignore
      domain: process.env.CLERK_FRONTEND_API_URL!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
