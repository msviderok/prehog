import { setupConvex } from 'convex-solidjs'
import type { JSXElement } from 'solid-js'
import { ConvexClerkProvider } from './convex-clerk'
import { env } from '@/env'

const CONVEX_URL = env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  console.error('missing envar VITE_CONVEX_URL')
}

export default function AppConvexProvider(props: { children: JSXElement }) {
  const client = setupConvex(CONVEX_URL)
  return <ConvexClerkProvider client={client}>{props.children}</ConvexClerkProvider>
}
