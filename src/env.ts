import { createEnv } from '@t3-oss/env-core'
import { vercel } from '@t3-oss/env-core/presets-valibot'
import * as v from 'valibot'

export const env = createEnv({
  server: {
    SERVER_URL: v.optional(v.pipe(v.string(), v.url())),
    CLERK_FRONTEND_API_URL: v.pipe(v.string(), v.url()),
    CLERK_SECRET_KEY: v.optional(v.pipe(v.string(), v.minLength(1))),
    CLERK_JWT_ISSUER_DOMAIN: v.optional(v.pipe(v.string(), v.url())),
  },

  extends: [vercel()],

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: v.optional(v.pipe(v.string(), v.minLength(1))),
    VITE_CONVEX_URL: v.pipe(v.string(), v.url()),
    VITE_CLERK_PUBLISHABLE_KEY: v.pipe(v.string(), v.minLength(1)),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    ...import.meta.env,
    ...((globalThis as any).process?.env ?? {}),
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Valibot validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Valibot will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
