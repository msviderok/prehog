import { createFileRoute } from '@tanstack/solid-router'
import { Door } from './-components'
import ladderImgSrc from './-assets/c_asset_ladder.png?url'
import { useRouteAssets } from '@/lib/useRouteAssets'

export const Route = createFileRoute('/_authed/application/')({
  component: RouteComponent,
  staticData: { scene: 'application' },
  head: ({ match }) => {
    const images = useRouteAssets(match.routeId)
    return {
      links: Object.values(images).map((href) => ({ rel: 'preload', as: 'image', href })),
    }
  },
})

function RouteComponent() {
  const assets = useRouteAssets(Route)
  return (
    <div>
      <div
        class="asset absolute top-0 left-0 size-200 translate-10"
        style={{ 'background-image': `url(${assets['c_asset_wide.png']})` }}
      />

      <Door />
      {/*<ul>
        <li>
          Things we care about
          <ul>
            <li>Transparency</li>
            <li>Autonomy</li>
            <li>Shipping fast</li>
            <li>Time for building</li>
            <li>Ambition</li>
            <li>Being weird</li>
          </ul>
        </li>

        <li>
          Who we're looking for
          <ul>
            <li>Enthusiastic drivers</li>
            <li>Optimistic problem solvers</li>
            <li>Grown ups</li>
            <li>Genuine builders</li>
          </ul>
        </li>

        <li>
          What you'll be doing
          <ul>
            <li>Owning products and features from beginning to end</li>
            <li>Collaborating with design (when necessary)</li>
            <li>Talking to users</li>
            <li>Doing support</li>
            <li>Writing docs</li>
          </ul>
        </li>

        <li>
          Requirements
          <ul>
            <li>You've built things agents actually use</li>
            <li>Full-stack experience with relevant technologies</li>
            <li>Experience taking a project from 0 to 1</li>
            <li>Strong writing skills</li>
          </ul>
        </li>

        <li>
          Nice to have
          <ul>
            <li>Have worked at a high-growth SaaS company before</li>
            <li>Extensive knowledge of Django and/or TypeScript-based React</li>
            <li>Experience building AI-native products, or integrating AI into existing software</li>
          </ul>
        </li>
      </ul>*/}
    </div>
  )
}
