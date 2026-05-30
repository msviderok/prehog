import { v } from 'convex/values'
import { mutation } from './_generated/server'
import * as Users from './model/users'
import * as Chats from './model/chats'

export const initCall = mutation({
  args: {
    chatId: v.id('chats'),
    audio: v.boolean(),
    video: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const chat = await Chats.getChatById(ctx, { myId: user._id, chatId: args.chatId })
  },
})
