import { api } from '@/convex/api'
import { Loading } from '@/routes/_authed/-components/Loading'
import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'
import { cn } from 'cn'
import { GameEngine } from './-components/GlobalStateProvider'

export const Route = createFileRoute('/_authed')({
  staticData: { scene: null },
  async beforeLoad({ context, matches }) {
    const { scene } = await context.convexHttpClient.query(api.gameState.currentScene)
    const currentPage = matches.find((m) => m.staticData.scene === scene)
    if (!currentPage) throw redirect({ to: `/${scene}` })
  },
  pendingComponent() {
    return <Loading type="clerk" />
  },
  component() {
    return (
      <GameEngine>
        <main
          class={cn(
            'h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden justify-center',
          )}
        >
          <Outlet />
        </main>
      </GameEngine>
    )
  },
})
