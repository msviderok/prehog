import type { WebhookEvent } from '@clerk/backend'
import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text()
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook event', error)
    return null
  }
}

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request)
    if (!event) {
      return new Response('Error occured', { status: 400 })
    }

    switch (event.type) {
      case 'user.created': // intentional fallthrough
      case 'user.updated':
        await ctx.runMutation(internal.clerk.upsertUserFromClerk, { data: event.data })
        break
      case 'user.deleted': {
        const clerkUserId = event.data.id!
        await ctx.runMutation(internal.clerk.deleteUserFromClerk, { clerkUserId })
        break
      }

      case 'session.created': {
        await ctx.runMutation(internal.clerk.createSession, { data: event.data.user, clerkUserId: event.data.user_id })
        break
      }
      case 'session.ended':
      case 'session.revoked':
      case 'session.removed': {
        await ctx.runMutation(internal.clerk.deleteSession, { clerkUserId: event.data.user_id })
        break
      }

      default:
        console.log('Ignored Clerk webhook event', event.type)
    }

    return new Response(null, { status: 200 })
  }),
})

http.route({
  path: '/tg',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const update = await request.json()
    console.log(update)
    return new Response('OK')
  }),
})

export default http
