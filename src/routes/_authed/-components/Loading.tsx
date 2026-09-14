import type { ParentProps } from 'solid-js'

export function LoadingClerk() {
  return (
    <Wrapper>
      <div class="flex flex-col items-center justify-center relative bg-tertiary rounded-full size-75 animate-pulse [--player-width-scaled:150px] [--player-height-scaled:150px]">
        <div class="relative player player-walk [--tx:calc(50%+0.5em)] [--ty:calc(50%-1em)]" />
        <span class="text-accent tracking-wide typing">Loading Clerk</span>
      </div>
    </Wrapper>
  )
}

export function LoadingConvex() {
  return (
    <Wrapper>
      <div class="flex flex-col items-center justify-center relative bg-tertiary rounded-full size-75 animate-pulse [--player-width-scaled:150px] [--player-height-scaled:150px]">
        <div class="relative player player-walk [--tx:calc(50%+0.5em)] [--ty:calc(50%-1em)]" />
        <span class="text-accent tracking-wide typing">Loading Game State</span>
      </div>
    </Wrapper>
  )
}

export function Loading(props: { type: 'clerk' | 'convex' }) {
  return (
    <Wrapper>
      <div class="flex flex-col items-center justify-center relative bg-tertiary rounded-full size-75 animate-pulse [--player-width-scaled:150px] [--player-height-scaled:150px]">
        <div class="relative player player-walk [--tx:calc(50%+0.5em)] [--ty:calc(50%-1em)]" />
        <span class="text-accent tracking-wide typing">Loading {props.type === 'clerk' ? 'Clerk' : 'Game State'}</span>
      </div>
    </Wrapper>
  )
}

function Wrapper(props: ParentProps) {
  return <div class="flex items-center justify-center size-full">{props.children}</div>
}
