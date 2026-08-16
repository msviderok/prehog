import { useQuery } from 'convex-solidjs'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { createEffect, createMemo, mergeProps, on, splitProps, type Accessor } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { access, defaultProps } from './utils'

interface QueryOptions<T> {
  enabled?: boolean
  initialData?: T
  keepPreviousData?: boolean
}

interface QueryReturn<T> {
  data: Accessor<T | undefined>
  error: Accessor<Error | undefined>
  isLoading: Accessor<boolean>
  isStale: Accessor<boolean>
  refetch: () => void
}

export const useStableQuery = <Query extends FunctionReference<'query'>>(
  query: Query,
  args?: FunctionArgs<Query> & { reconcileKey?: string | undefined },
  options?: QueryOptions<FunctionReturnType<Query>>,
): QueryReturn<FunctionReturnType<Query>> => {
  const [state, setState] = createStore<{ data: FunctionReturnType<Query> | undefined }>({ data: undefined })
  const mergedOptions = defaultProps(options ?? {}, { keepPreviousData: true })
  const [customArgs, queryArgs] = splitProps(args ?? ({} as NonNullable<typeof args>), ['reconcileKey'])
  const { data: originalData, ...result } = useQuery(query, () => queryArgs, mergedOptions)

  createEffect(
    on(originalData, (data) => {
      if (data === undefined) return
      setState('data', reconcile(data, { merge: true, key: customArgs.reconcileKey }))
    }),
  )

  return mergeProps(result, { data: () => state.data })
}
