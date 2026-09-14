import { Asset } from '@/routes/_authed/-components/Asset'
import { Door } from '@/routes/_authed/-components/Door'
import * as Scene from '@/routes/_authed/-components/Scene'

export function Scenery() {
  return (
    <Scene.Elements>
      <Asset
        routeId="/_authed/application/"
        asset="bg_town.png"
        scale={1}
        height={420}
        class="bg-repeat-x bg-auto w-full opacity-80 hue-rotate-230 blur-[0.7px]"
      />

      <div>
        <Asset routeId="/_authed/application/" asset="pilar.png" x={10} y={0} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={10} y={15} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={30} y={0} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={30} y={15} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={50} y={0} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={50} y={15} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={70} y={0} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={70} y={15} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={90} y={0} class="[--rz:90deg]" />
        <Asset routeId="/_authed/application/" asset="pilar.png" x={90} y={15} class="[--rz:90deg]" />
      </div>

      <div class="opacity-100 translate-y-2">
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={-1} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={15} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={30} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={45} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={60} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={75} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={90} y={0} />
      </div>

      <Asset
        routeId="/_authed/application/"
        asset="c_asset_ladder.png"
        scale={0.9}
        x={85}
        y={18}
        class="origin-center [--skx:2deg]"
      />

      <div class="opacity-70 scale-y-150">
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={-4} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={10} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={24} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={38} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={52} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={66} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={80} y={0} />
        <Asset routeId="/_authed/application/" asset="c_asset_wide.png" scale={1} x={94} y={0} />
      </div>

      <div class="opacity-100 -translate-y-2 -translate-x-10">
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={-1} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={15} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={30} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={45} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={60} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={75} y={0} />
        <Asset routeId="/_authed/application/" asset="pilar.png" scale={1} x={90} y={0} />
      </div>

      <Asset routeId="/_authed/application/" asset="hog_donotcross.png" scale={0.5} x={0} y={20} />
      <Asset routeId="/_authed/application/" asset="boxes.png" scale={0.3} x={60} y={3.6} />
      <Truck />
      <Asset routeId="/_authed/application/" asset="c_asset_normal.png" scale={0.8} x={65} y={28} />

      <div>
        <Asset routeId="/_authed/application/" asset="c_asset_normal.png" scale={0.9} x={30} y={30} />
        <Asset routeId="/_authed/application/" asset="c_asset_normal.png" scale={0.9} x={37.5} y={30} />
      </div>

      <Asset
        routeId="/_authed/application/"
        asset="c_asset_ladder.png"
        scale={0.9}
        x={33}
        y={32}
        class="origin-center [--skx:-6deg]"
      />

      <div class="transform-3d">
        <Door to="main" position={{ x: 10, y: 72 }} />
        <Scene.Players />
      </div>

      <Asset routeId="/_authed/application/" asset="hog_drill.png" scale={0.55} x={30} y={68} />
      <Asset routeId="/_authed/application/" asset="hog_noting.png" scale={0.55} x={74} y={25} />
    </Scene.Elements>
  )
}

function Truck() {
  return (
    <Asset routeId="/_authed/application/" asset="hog_truck.png" scale={0.3} x={50} y={21} class="animate-truckMoving">
      <Asset
        routeId="/_authed/application/"
        asset="truck_wheel.png"
        scale={0.3}
        class="bottom-[2.5%] right-[34.2%] top-[unset] left-[unset] origin-center animate-truckWheelSpin [--tx:0]"
      />
      <Asset
        routeId="/_authed/application/"
        asset="truck_wheel.png"
        scale={0.3}
        class="bottom-[2.5%] left-[2%] delay-75 rotate-45 top-[unset]  origin-center animate-truckWheelSpin [--tx:0]"
      />
    </Asset>
  )
}

{
  /*<ul>
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
</ul>*/
}
