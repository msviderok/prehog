import { HAT_INDEX, type Hat } from '@/lib/constants'

export function Hat(props: { hat: Hat }) {
  return <span style={{ '--hat-index': HAT_INDEX[props.hat] }} class="hat" />
}
