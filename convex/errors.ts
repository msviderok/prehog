import { ConvexError } from 'convex/values'

export function unauthenticated(): never {
  throw new ConvexError({ code: 'UNAUTHENTICATED' })
}

/** User exists in Clerk but not in Convex */
export function authMismtach(): never {
  throw new ConvexError({ code: 'AUTH_MISMATCH' })
}

export function badData(): never {
  throw new ConvexError({ code: 'BAD_DATA' })
}
