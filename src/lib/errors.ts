import { ConvexError } from 'convex/values'

export function isUnauthenticatedError(error: unknown) {
  return error instanceof ConvexError && error.data?.code === 'UNAUTHENTICATED'
}

export function isAuthMismatchError(error: unknown) {
  return error instanceof ConvexError && error.data?.code === 'AUTH_MISMATCH'
}
