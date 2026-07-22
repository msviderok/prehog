import { useQuery } from 'convex-solidjs'
import type { QueryOptions } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { createEffect, createMemo, mergeProps, on, splitProps, type Accessor } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { access } from './utils'

interface QueryReturn<T> {
  data: Accessor<T | undefined>
  error: Accessor<Error | undefined>
  isLoading: Accessor<boolean>
  isStale: Accessor<boolean>
  refetch: () => void
}

export const useStableQuery = <Query extends FunctionReference<'query'>>(
  query: Query,
  args?: MaybeAccessor<FunctionArgs<Query> & { reconcileKey?: string | undefined }>,
  options?: MaybeAccessor<QueryOptions<FunctionReturnType<Query>>>,
): QueryReturn<FunctionReturnType<Query>> => {
  const [state, setState] = createStore<{ data: FunctionReturnType<Query> | undefined }>({ data: undefined })
  const splittedArgs = createMemo(() => {
    const [customArgs, queryArgs] = splitProps(access(args ?? {}), ['reconcileKey'])
    return { customArgs: customArgs as { reconcileKey?: string | undefined }, queryArgs }
  })

  const { data: originalData, ...result } = useQuery(query, () => splittedArgs().queryArgs, options)

  createEffect(
    on(originalData, (data) => {
      if (data === undefined) return
      setState('data', reconcile(data, { merge: true, key: splittedArgs().customArgs.reconcileKey }))
    }),
  )

  return mergeProps(result, { data: () => state.data })
}
