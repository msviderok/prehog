import { Doc, Id } from '../_generated/dataModel'
import { type MutationCtx, type QueryCtx } from '../_generated/server'
import { type PanelTypeChat, type PanelTypeRTC } from '../helpers'
import * as Users from './users'

export async function getNextHighestLayer(ctx: QueryCtx) {
  const user = await Users.getCurrentUser(ctx)
  const panels = await ctx.db
    .query('floating_panels')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect()
  const positions = await Promise.all(panels.map(({ positionId }) => ctx.db.get(positionId)))
  return (positions.map((p) => p?.zIndex ?? 0).sort(Math.max)[0] ?? 0) + 1
}

export async function getMyFloatingPanel(
  ctx: QueryCtx | MutationCtx,
  args: Pick<PanelTypeChat, 'type' | 'chatId'> | Pick<PanelTypeRTC, 'type' | 'callId'>,
) {
  const user = await Users.getCurrentUser(ctx)
  switch (args.type) {
    case 'chat':
      return ctx.db
        .query('floating_panels')
        .withIndex('by_user_chat', (q) => q.eq('userId', user._id).eq('chatId', args.chatId))
        .unique()
    case 'rtc':
      return ctx.db
        .query('floating_panels')
        .withIndex('by_user_call', (q) => q.eq('userId', user._id).eq('callId', args.callId))
        .unique()
  }
}

export async function getFloatingPanel(
  ctx: QueryCtx | MutationCtx,
  args: Pick<PanelTypeChat, 'type' | 'chatId' | 'userId'> | Pick<PanelTypeRTC, 'type' | 'callId' | 'userId'>,
) {
  switch (args.type) {
    case 'chat':
      return ctx.db
        .query('floating_panels')
        .withIndex('by_user_chat', (q) => q.eq('userId', args.userId).eq('chatId', args.chatId))
        .unique()
    case 'rtc':
      return ctx.db
        .query('floating_panels')
        .withIndex('by_user_call', (q) => q.eq('userId', args.userId).eq('callId', args.callId))
        .unique()
  }
}

export async function createNewPanel(
  ctx: MutationCtx,
  args: Pick<Doc<'floating_panels_position'>, 'x' | 'y'> &
    (Pick<PanelTypeChat, 'type' | 'chatId' | 'userId'> | Pick<PanelTypeRTC, 'type' | 'callId' | 'userId'>),
) {
  await cleanupExistingPanelIfExists(ctx, args)

  const zIndex = await getNextHighestLayer(ctx)
  const positionId = await ctx.db.insert('floating_panels_position', { zIndex, x: args.x, y: args.y })
  const floatingPanelId = await ctx.db.insert(
    'floating_panels',
    args.type === 'chat'
      ? { type: 'chat', chatId: args.chatId, userId: args.userId, positionId }
      : { type: 'rtc', callId: args.callId, userId: args.userId, positionId },
  )

  const panel = await ctx.db.get(floatingPanelId)
  if (!panel) throw new Error('Newly added panel not found. Hmmm, interesting...')
  return panel
}

export async function deletePanel(ctx: MutationCtx, panel: Doc<'floating_panels'> | Doc<'floating_panels'>[]) {
  if (Array.isArray(panel)) {
    for (const p of panel) {
      await ctx.db.delete(p.positionId)
      await ctx.db.delete(p._id)
    }
  } else {
    await ctx.db.delete(panel.positionId)
    await ctx.db.delete(panel._id)
  }
}

export async function deletePanelsForCall(ctx: MutationCtx, callId: Id<'calls'>) {
  const panels = await ctx.db
    .query('floating_panels')
    .withIndex('by_call', (q) => q.eq('callId', callId))
    .collect()
  await Promise.all(panels.map((p) => deletePanel(ctx, p)))
}

export async function deletePanelById(ctx: MutationCtx, panelId: Id<'floating_panels'>) {
  const panel = await ctx.db.get(panelId)
  if (panel) await deletePanel(ctx, panel)
}

export async function cleanupExistingPanelIfExists(
  ctx: MutationCtx,
  args: Pick<PanelTypeChat, 'type' | 'chatId' | 'userId'> | Pick<PanelTypeRTC, 'type' | 'callId' | 'userId'>,
) {
  const existingRtcPanel = await getFloatingPanel(ctx, args)
  if (existingRtcPanel) {
    await ctx.db.delete('floating_panels', existingRtcPanel._id)
    await ctx.db.delete('floating_panels_position', existingRtcPanel.positionId)
  }
}
