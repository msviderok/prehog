import { type AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      type: 'customJwt',
      // @ts-ignore
      issuer: process.env.CLERK_FRONTEND_API_URL,
      // @ts-ignore
      jwks: `${process.env.CLERK_FRONTEND_API_URL}/.well-known/jwks.json`,
      algorithm: 'RS256',
    },
  ],
} satisfies AuthConfig
