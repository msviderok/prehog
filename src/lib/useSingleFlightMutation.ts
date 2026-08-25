/**
 * Based on
 * https://github.com/get-convex/presence/blob/d78fd2af39837bdad0d55e52137004e006a734dc/src/react/useSingleFlight.ts
 */

import { useMutation } from 'convex-solidjs'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import { mergeProps, type Accessor } from 'solid-js'

interface MutationReturn<TArgs, TResult> {
  mutate: (args: TArgs) => Promise<TResult>
  mutateAsync: (args: TArgs) => Promise<TResult>
  data: Accessor<TResult | undefined>
  error: Accessor<Error | undefined>
  isLoading: Accessor<boolean>
  reset: () => void
}

export function useSingleFlightMutation<
  Mutation extends FunctionReference<'mutation'>,
  Args extends FunctionArgs<Mutation>,
>(mutation: Mutation): MutationReturn<FunctionArgs<Mutation>, FunctionReturnType<Mutation>> {
  const mut = useMutation(mutation)
  const flightStatus = {
    inFlight: false,
    upNext: null as null | {
      fn: typeof mut.mutate
      resolve: any
      reject: any
      args: Args
    },
  }

  function singleFlightMutate(args: FunctionArgs<Mutation>) {
    if (flightStatus.inFlight) {
      return new Promise((resolve, reject) => {
        flightStatus.upNext = { fn: mut.mutate, resolve, reject, args }
      })
    }
    flightStatus.inFlight = true
    const firstReq = mut.mutate(args)
    void (async () => {
      try {
        await firstReq
      } finally {
        // If it failed, we naively just move on to the next request.
      }
      while (flightStatus.upNext) {
        const cur = flightStatus.upNext
        flightStatus.upNext = null
        await cur.fn(cur.args).then(cur.resolve).catch(cur.reject)
      }
      flightStatus.inFlight = false
    })()
    return firstReq
  }

  return mergeProps(mut, {
    mutate: singleFlightMutate,
    mutateAsync: singleFlightMutate,
  })
}
