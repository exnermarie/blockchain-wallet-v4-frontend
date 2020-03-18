import { Props } from '../template.success'
import { SBEnterAmountFormValuesType } from 'data/types'

export const maximumAmount = (
  value: string,
  allValues: SBEnterAmountFormValuesType
) => {
  if (!allValues.pair) return
  return Number(value) > Number(allValues.pair.buyMax) ? 'Above max' : false
}

export const minimumAmount = (
  value: string,
  allValues: SBEnterAmountFormValuesType
) => {
  if (!allValues.pair) return
  return Number(value) < Number(allValues.pair.buyMin) ? 'Below min' : false
}
