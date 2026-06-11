import type { GameEventLogItem } from './game.types'

export type GameCardMetadata = {
  key: string
  deck: 'chance' | 'world_fund'
  title: string
  copy: string
}

export const gameCardsByKey: Record<string, GameCardMetadata> = {
  chance_bank_dividend: {
    key: 'chance_bank_dividend',
    deck: 'chance',
    title: 'Bank dividend',
    copy: 'Collect W50 from the bank.',
  },
  chance_advance_to_go: {
    key: 'chance_advance_to_go',
    deck: 'chance',
    title: 'Advance to Go',
    copy: 'Move to Go and collect W200.',
  },
  chance_go_to_jail: {
    key: 'chance_go_to_jail',
    deck: 'chance',
    title: 'Go to Jail',
    copy: 'Move directly to Jail. Do not pass Go.',
  },
  chance_pay_school_fees: {
    key: 'chance_pay_school_fees',
    deck: 'chance',
    title: 'Pay school fees',
    copy: 'Pay W50 to the bank.',
  },
  chance_get_out_of_jail_free: {
    key: 'chance_get_out_of_jail_free',
    deck: 'chance',
    title: 'Get Out of Jail Free',
    copy: 'Keep this card until you need it.',
  },
  world_fund_receive_25: {
    key: 'world_fund_receive_25',
    deck: 'world_fund',
    title: 'World fund support',
    copy: 'Collect W25 from the bank.',
  },
  world_fund_pay_hospital: {
    key: 'world_fund_pay_hospital',
    deck: 'world_fund',
    title: 'Pay hospital fees',
    copy: 'Pay W100 to the bank.',
  },
  world_fund_advance_to_go: {
    key: 'world_fund_advance_to_go',
    deck: 'world_fund',
    title: 'Advance to Go',
    copy: 'Move to Go and collect W200.',
  },
  world_fund_go_to_jail: {
    key: 'world_fund_go_to_jail',
    deck: 'world_fund',
    title: 'Go to Jail',
    copy: 'Move directly to Jail. Do not pass Go.',
  },
  world_fund_get_out_of_jail_free: {
    key: 'world_fund_get_out_of_jail_free',
    deck: 'world_fund',
    title: 'Get Out of Jail Free',
    copy: 'Keep this card until you need it.',
  },
}

export function getCardRevealFromEvent(event?: GameEventLogItem | null) {
  if (!event || event.type !== 'card_drawn') {
    return null
  }

  const cardKey = getEventString(event, 'cardKey')

  if (!cardKey) {
    return null
  }

  return gameCardsByKey[cardKey] ?? null
}

function getEventString(event: GameEventLogItem, key: string) {
  const value = event.payload[key]

  return typeof value === 'string' ? value : null
}
