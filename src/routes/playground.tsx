import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { createFileRoute } from '@tanstack/solid-router'
import { MessageSquareText, Music, Video } from 'lucide-solid'

export const Route = createFileRoute('/playground')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center justify-center relative">
      <div class="relative size-100 border-2 rounded-sm border-yellow-900/10">
        <div class="flex w-full h-20">
          <ToggleGroup>
            <ToggleGroupItem>
              <Video />
            </ToggleGroupItem>
            <ToggleGroupItem>
              <Music />
            </ToggleGroupItem>
            <ToggleGroupItem>
              <MessageSquareText />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </main>
  )
}
