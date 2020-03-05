import { LoanType } from 'core/types'
import { Text } from 'blockchain-info-components'
import React from 'react'
import styled from 'styled-components'

// same style for all children
export const Value = styled(Text)<{ size?: string }>`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${props => props.theme.grey800};
  * {
    font-size: 14px !important;
    font-weight: 500 !important;
    color: ${props => props.theme.grey800} !important;
  }
`

const OrangeValue = styled(Value)`
  color: ${props => props.theme.orange600};
`
const GreenValue = styled(Value)`
  color: ${props => props.theme.green600};
`
const RedValue = styled(Value)`
  color: ${props => props.theme.red600};
`

export const Status = (props: LoanType) => {
  switch (props.status) {
    case 'OPEN':
      return <GreenValue>Open</GreenValue>
    case 'PENDING_EXECUTION':
    case 'PENDING_COLLATERAL_DEPOSIT':
      return <OrangeValue>Pending</OrangeValue>
    case 'PENDING_PRINCIPAL_WITHDRAW':
      return <OrangeValue>Pending Principal</OrangeValue>
    case 'PENDING_CLOSE':
      return <OrangeValue>Repayment in-progress</OrangeValue>
    case 'ON_CALL':
      return <Value>On Call</Value>
    case 'CLOSED':
      return <Value>Closed</Value>
    case 'LIQUIDATED':
      return <RedValue>Liquidated</RedValue>
    case 'FAILED':
      return <RedValue>Failed</RedValue>
    default:
      return <Value>Unknown Status</Value>
  }
}
