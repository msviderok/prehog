import type { Doc } from './_generated/dataModel'
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'

async function getProfileByTokenIdentifier(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
  return await ctx.db
    .query('userProfiles')
    .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

function toPublicUserProfile(profile: Doc<'userProfiles'>) {
  return {
    _id: profile._id,
    _creationTime: profile._creationTime,
    tokenIdentifier: profile.tokenIdentifier,
    subject: profile.subject,
    email: profile.email,
    name: profile.name,
    imageUrl: profile.imageUrl,
    updatedAt: profile.updatedAt,
  }
}

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return null
    }

    const profile = await getProfileByTokenIdentifier(ctx, identity.tokenIdentifier)
    return profile ? toPublicUserProfile(profile) : null
  },
})

export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const existing = await getProfileByTokenIdentifier(ctx, identity.tokenIdentifier)
    const now = Date.now()

    if (!existing) {
      const profile = {
        tokenIdentifier: identity.tokenIdentifier,
        subject: identity.subject,
        ...(identity.email ? { email: identity.email } : {}),
        ...(identity.name ? { name: identity.name } : {}),
        ...(identity.pictureUrl ? { imageUrl: identity.pictureUrl } : {}),
        updatedAt: now,
      }
      const profileId = await ctx.db.insert('userProfiles', profile)

      return toPublicUserProfile({
        _id: profileId,
        _creationTime: now,
        ...profile,
      })
    }

    const patch: Partial<Doc<'userProfiles'>> = {}

    if (existing.subject !== identity.subject) {
      patch.subject = identity.subject
    }

    if (identity.email && existing.email !== identity.email) {
      patch.email = identity.email
    }

    if (identity.name && existing.name !== identity.name) {
      patch.name = identity.name
    }

    if (identity.pictureUrl && existing.imageUrl !== identity.pictureUrl) {
      patch.imageUrl = identity.pictureUrl
    }

    if (Object.keys(patch).length === 0) {
      return toPublicUserProfile(existing)
    }

    const updatedProfile = {
      ...existing,
      ...patch,
      updatedAt: now,
    }

    await ctx.db.patch(existing._id, {
      ...patch,
      updatedAt: now,
    })

    return toPublicUserProfile(updatedProfile)
  },
})
