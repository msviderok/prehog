import { useQuery } from 'convex-solidjs'
import type { QueryOptions } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { createEffect, mergeProps, on, type Accessor } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'

interface QueryReturn<T> {
  data: Accessor<T | undefined>
  error: Accessor<Error | undefined>
  isLoading: Accessor<boolean>
  isStale: Accessor<boolean>
  refetch: () => void
}

export const useStableQuery = <Query extends FunctionReference<'query'>>(
  query: Query,
  args?: MaybeAccessor<FunctionArgs<Query>>,
  options?: MaybeAccessor<QueryOptions<FunctionReturnType<Query>>>,
): QueryReturn<FunctionReturnType<Query>> => {
  const [state, setState] = createStore<{ data: FunctionReturnType<Query> | undefined }>({ data: undefined })
  const { data: originalData, ...result } = useQuery(query, args ?? {}, options)

  createEffect(
    on(originalData, (data) => {
      if (data === undefined) return
      setState('data', reconcile(data, { key: '_id' }))
    }),
  )

  return mergeProps(result, { data: () => state.data })
}
