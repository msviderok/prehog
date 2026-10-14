import { useQuery } from 'convex-solidjs'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { createEffect, mergeProps, on, splitProps, type Accessor } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { defaultProps } from './utils'

interface BaseQueryOptions {
  enabled?: boolean
  keepPreviousData?: boolean
}

interface QueryOptionsWithInitialData<T> extends BaseQueryOptions {
  initialData: T
}

interface QueryOptions<T> extends BaseQueryOptions {
  initialData?: T
}

interface QueryReturn<T, HasInitialData extends boolean> {
  data: Accessor<HasInitialData extends true ? T : T | undefined>
  error: Accessor<Error | undefined>
  isLoading: Accessor<boolean>
  isStale: Accessor<boolean>
  refetch: () => void
}

export function useStableQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query> & { reconcileKey?: string | undefined },
  options: QueryOptionsWithInitialData<FunctionReturnType<Query>>,
): QueryReturn<FunctionReturnType<Query>, true>
export function useStableQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args?: FunctionArgs<Query> & { reconcileKey?: string | undefined },
  options?: QueryOptions<FunctionReturnType<Query>>,
): QueryReturn<FunctionReturnType<Query>, false>
export function useStableQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args?: FunctionArgs<Query> & { reconcileKey?: string | undefined },
  options?: QueryOptions<FunctionReturnType<Query>>,
): QueryReturn<FunctionReturnType<Query>, boolean> {
  const [state, setState] = createStore({ data: options?.initialData })
  const mergedOptions = defaultProps(options ?? {}, { keepPreviousData: true, initialData: options?.initialData })
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
