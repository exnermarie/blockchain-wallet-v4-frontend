import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Field, reduxForm } from 'redux-form'

import { required, validBitcoinCashAddress } from 'services/FormHelper'
import { Button, Icon, Tooltip } from 'blockchain-info-components'
import { FiatConvertor, Form, FormGroup, FormItem, FormLabel, SelectBoxBitcoinAddresses, SelectBoxCoin, TextBox, TextArea } from 'components/Form'
import ComboDisplay from 'components/Display/ComboDisplay'
import { maximumAmount, emptyAmount } from './services'
import QRCodeCapture from 'components/QRCodeCapture'

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`
const AddressButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  border: 1px solid ${props => props.theme['gray-2']};

  &:hover { background-color: ${props => props.theme['gray-1']}; }
`

const FirstStep = props => {
  const { invalid, submitting, fee, toToggled, handleToToggle, handleSubmit } = props

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup inline margin={'15px'}>
        <FormItem width={'40%'}>
          <FormLabel for='coin'>
            <FormattedMessage id='modals.sendBch.firststep.coin' defaultMessage='Currency:' />
          </FormLabel>
          <Field name='coin' component={SelectBoxCoin} validate={[required]} />
        </FormItem>
        <FormItem width={'60%'}>
          <FormLabel for='from'>
            <FormattedMessage id='modals.sendBch.firststep.from' defaultMessage='From:' />
          </FormLabel>
          <Field name='from' component={SelectBoxBitcoinAddresses} validate={[required]} coin='BCH' props={{ includeAll: false }} />
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel for='to'>
            <FormattedMessage id='modals.sendBch.firststep.to' defaultMessage='To:' />
          </FormLabel>
          <Row>
            {toToggled
              ? <Field name='to' placeholder="Paste or scan an address, or select a destination" component={SelectBoxBitcoinAddresses} coin='BCH' validate={[required]} />
              : <Field name='to' placeholder="Paste or scan an address, or select a destination" component={TextBox} validate={[required, validBitcoinCashAddress]} />
            }
            <QRCodeCapture coin='BCH' />
            {toToggled
              ? <AddressButton onClick={handleToToggle}><Icon name='pencil' size='16px' cursor /></AddressButton>
              : <AddressButton onClick={handleToToggle}><Icon name='down-arrow' size='10px' cursor /></AddressButton>
            }
          </Row>
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel for='amount'>
            <FormattedMessage id='modals.requestbitcoin.firststep.amount' defaultMessage='Enter Amount:' />
          </FormLabel>
          <Field name='amount' component={FiatConvertor} validate={[required, maximumAmount, emptyAmount]} coin='BCH' />
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel>
            <FormattedMessage id='modals.sendBch.firststep.description' defaultMessage='Description:&nbsp;' />
            <Tooltip>
              <FormattedMessage id='modals.sendBch.firststep.share_tooltip' defaultMessage='Add a note to remind yourself what this transaction relates to. This note will be private and only seen by you.' />
            </Tooltip>
          </FormLabel>
          <Field name='message' component={TextArea} placeholder="What's this transaction for?" fullwidth />
        </FormItem>
      </FormGroup>
      <FormGroup inline margin={'30px'}>
        <FormItem>
          <FormLabel>
            <FormattedMessage id='modals.sendBch.firststep.fee' defaultMessage='Transaction fee:' />
          </FormLabel>
          <ComboDisplay coin='BCH'>{fee}</ComboDisplay>
        </FormItem>
      </FormGroup>
      <FormGroup>
        <Button type='submit' nature='primary' uppercase disabled={submitting || invalid}>
          <FormattedMessage id='modals.sendBch.firststep.continue' defaultMessage='Continue' />
        </Button>
      </FormGroup>
    </Form>
  )
}

FirstStep.propTypes = {
  // invalid: PropTypes.bool.isRequired,
  // submitting: PropTypes.bool.isRequired,
  // addressSelectToggled: PropTypes.bool.isRequired,
  // addressSelectOpened: PropTypes.bool.isRequired,
  // feeEditToggled: PropTypes.bool.isRequired,
  // totalFee: PropTypes.number,
  // fee: PropTypes.string.isRequired,
  // handleSubmit: PropTypes.func.isRequired,
  // handleClickAddressToggler: PropTypes.func.isRequired,
  // handleClickFeeToggler: PropTypes.func.isRequired
}

export default reduxForm({ form: 'sendBch', destroyOnUnmount: false })(FirstStep)
