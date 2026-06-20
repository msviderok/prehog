import { Doc } from './_generated/dataModel'

export type PanelTypeChat = Extract<Doc<'floating_panels'>, { type: 'chat' }>
export type PanelTypeRTC = Extract<Doc<'floating_panels'>, { type: 'rtc' }>
