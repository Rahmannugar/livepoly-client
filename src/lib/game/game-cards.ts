import type { GameEventLogItem } from './game.types'

export type GameCardMetadata = {
  key: string
  deck: 'chance' | 'world_fund'
  title: string
  copy: string
}

export type GameCardReveal = {
  id: string
  card: GameCardMetadata
}

export const gameCardsByKey: Record<string, GameCardMetadata> = {
  chance_bank_dividend: {
    key: 'chance_bank_dividend',
    deck: 'chance',
    title: 'Bank dividend',
    copy: 'Collect W50 from the bank.',
  },
  chance_chairman_bonus: {
    key: 'chance_chairman_bonus',
    deck: 'chance',
    title: 'Chairman bonus',
    copy: 'Collect W150 from the bank.',
  },
  chance_advance_to_go: {
    key: 'chance_advance_to_go',
    deck: 'chance',
    title: 'Advance to Go',
    copy: 'Move to Go and collect W200.',
  },
  chance_advance_to_spain: {
    key: 'chance_advance_to_spain',
    deck: 'chance',
    title: 'Advance to Spain',
    copy: 'Move to Spain. Collect W200 if you pass Go.',
  },
  chance_advance_to_uk: {
    key: 'chance_advance_to_uk',
    deck: 'chance',
    title: 'Advance to United Kingdom',
    copy: 'Move to United Kingdom. Collect W200 if you pass Go.',
  },
  chance_advance_to_lagos_airport: {
    key: 'chance_advance_to_lagos_airport',
    deck: 'chance',
    title: 'Advance to Lagos Airport',
    copy: 'Move to Lagos Airport. Collect W200 if you pass Go.',
  },
  chance_nearest_airport: {
    key: 'chance_nearest_airport',
    deck: 'chance',
    title: 'Nearest Airport',
    copy: 'Advance to the nearest Airport.',
  },
  chance_nearest_utility: {
    key: 'chance_nearest_utility',
    deck: 'chance',
    title: 'Nearest Utility',
    copy: 'Advance to the nearest Utility.',
  },
  chance_go_back_three: {
    key: 'chance_go_back_three',
    deck: 'chance',
    title: 'Go back three spaces',
    copy: 'Move back three spaces and resolve the square.',
  },
  chance_go_to_jail: {
    key: 'chance_go_to_jail',
    deck: 'chance',
    title: 'Go to Jail',
    copy: 'Move directly to Jail. Do not pass Go.',
  },
  chance_building_repairs: {
    key: 'chance_building_repairs',
    deck: 'chance',
    title: 'Make general repairs',
    copy: 'Pay W25 per house and W100 per hotel.',
  },
  chance_pay_school_fees: {
    key: 'chance_pay_school_fees',
    deck: 'chance',
    title: 'Pay school fees',
    copy: 'Pay W50 to the bank.',
  },
  chance_speeding_fine: {
    key: 'chance_speeding_fine',
    deck: 'chance',
    title: 'Speeding fine',
    copy: 'Pay W15 to the bank.',
  },
  chance_loan_matures: {
    key: 'chance_loan_matures',
    deck: 'chance',
    title: 'Loan matures',
    copy: 'Collect W150 from the bank.',
  },
  chance_pay_each_player: {
    key: 'chance_pay_each_player',
    deck: 'chance',
    title: 'Pay every player',
    copy: 'Pay W50 to every other player.',
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
  world_fund_bank_error: {
    key: 'world_fund_bank_error',
    deck: 'world_fund',
    title: 'Bank error in your favor',
    copy: 'Collect W200 from the bank.',
  },
  world_fund_doctor_fee: {
    key: 'world_fund_doctor_fee',
    deck: 'world_fund',
    title: 'Doctor fee',
    copy: 'Pay W50 to the bank.',
  },
  world_fund_sale_of_stock: {
    key: 'world_fund_sale_of_stock',
    deck: 'world_fund',
    title: 'Sale of stock',
    copy: 'Collect W50 from the bank.',
  },
  world_fund_pay_hospital: {
    key: 'world_fund_pay_hospital',
    deck: 'world_fund',
    title: 'Pay hospital fees',
    copy: 'Pay W100 to the bank.',
  },
  world_fund_life_insurance: {
    key: 'world_fund_life_insurance',
    deck: 'world_fund',
    title: 'Life insurance matures',
    copy: 'Collect W100 from the bank.',
  },
  world_fund_income_tax_refund: {
    key: 'world_fund_income_tax_refund',
    deck: 'world_fund',
    title: 'Income tax refund',
    copy: 'Collect W20 from the bank.',
  },
  world_fund_birthday: {
    key: 'world_fund_birthday',
    deck: 'world_fund',
    title: 'Birthday gift',
    copy: 'Collect W10 from every other player.',
  },
  world_fund_holiday_fund: {
    key: 'world_fund_holiday_fund',
    deck: 'world_fund',
    title: 'Holiday fund matures',
    copy: 'Collect W100 from the bank.',
  },
  world_fund_consultancy_fee: {
    key: 'world_fund_consultancy_fee',
    deck: 'world_fund',
    title: 'Consultancy fee',
    copy: 'Collect W25 from the bank.',
  },
  world_fund_street_repairs: {
    key: 'world_fund_street_repairs',
    deck: 'world_fund',
    title: 'Street repairs',
    copy: 'Pay W40 per house and W115 per hotel.',
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
  world_fund_beauty_contest: {
    key: 'world_fund_beauty_contest',
    deck: 'world_fund',
    title: 'Beauty contest prize',
    copy: 'Collect W10 from the bank.',
  },
  world_fund_inherit: {
    key: 'world_fund_inherit',
    deck: 'world_fund',
    title: 'Inheritance',
    copy: 'Collect W100 from the bank.',
  },
  world_fund_get_out_of_jail_free: {
    key: 'world_fund_get_out_of_jail_free',
    deck: 'world_fund',
    title: 'Get Out of Jail Free',
    copy: 'Keep this card until you need it.',
  },
}

export function getLatestCardRevealFromEvents(events: GameEventLogItem[]) {
  for (const event of events) {
    const reveal = getCardRevealFromEvent(event)

    if (reveal) {
      return reveal
    }
  }

  return null
}

function getCardRevealFromEvent(event?: GameEventLogItem | null) {
  if (!event || event.type !== 'card_drawn') {
    return null
  }

  const cardKey = getEventString(event, 'cardKey')

  if (!cardKey) {
    return null
  }

  const card = gameCardsByKey[cardKey]

  if (!card) {
    return null
  }

  return {
    id:
      event.sequence === null
        ? `${event.type}:${cardKey}:${event.createdAt}`
        : `event:${event.sequence}`,
    card,
  }
}

function getEventString(event: GameEventLogItem, key: string) {
  const value = event.payload[key]

  return typeof value === 'string' ? value : null
}
