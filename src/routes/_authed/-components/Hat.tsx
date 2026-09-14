import { HAT_INDEX, type Hat } from '@/lib/constants'
import { assets } from '@/routeAssets.gen'

export function Hat(props: { hat: Hat }) {
  return (
    <span
      class="hat"
      style={{
        '--hat-index': HAT_INDEX[props.hat],
        'background-image': `url(${assets['/_authed/']['hats.png'].src})`,
      }}
    />
  )
}
