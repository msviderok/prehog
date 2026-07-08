import { mutation, query } from './_generated/server'
import * as UsersGameState from './model/usersGameState'
import * as Users from './model/users'
import { INITIAL_PLAYER_POSITION } from '../src/lib/constants'

export const findMyActions = query({
  handler: async (ctx) => {
    const state = await UsersGameState.findMyGameState(ctx)
    return state?.actions ?? null
  },
})

export const findMyInitialPosition = query({
  handler: async (ctx) => {
    const state = await UsersGameState.findMyGameState(ctx)
    return state ? { x: state.x, y: state.y } : null
  },
})

export const create = mutation({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const existingState = await ctx.db
      .query('users_game_state')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique()
    if (existingState != null) {
      throw new Error('Game state already exists')
    }

    await ctx.db.insert('users_game_state', {
      userId: user._id,
      actions: [],
      x: INITIAL_PLAYER_POSITION.x,
      y: INITIAL_PLAYER_POSITION.y,
    })
  },
})
