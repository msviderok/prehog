import { Doc } from './_generated/dataModel'
import { env } from './_generated/server'

export type PanelTypeChat = Extract<Doc<'floating_panels'>, { type: 'chat' }>
export type PanelTypeRTC = Extract<Doc<'floating_panels'>, { type: 'rtc' }>

export const CRON_NAME_OFFLINE_CHECKER = 'offlineChecker'

export async function sendMessageToBot(text: string) {
  try {
    const data = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(env.TG_BOT_TOKEN!)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_BOT_CHAT_ID, text }),
      },
    )
    const json = await data.json()
    return json
  } catch (e) {
    console.warn('An error occured while sending message to bot', e)
  }
}
