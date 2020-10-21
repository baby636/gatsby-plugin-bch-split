/* eslint-disable */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box, Inputs, Button } from 'adminlte-2-react'
import 'gatsby-ipfs-web-wallet/src/components/qr-scanner/qr-scanner.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QrReader from 'react-qr-reader'
import { getWalletInfo } from 'gatsby-ipfs-web-wallet/src/components/localWallet'
const { Text } = Inputs
import ScannerModal from 'gatsby-ipfs-web-wallet/src/components/qr-scanner/modal'

let _this

class Split extends React.Component {
  constructor(props) {
    super(props)

    _this = this

    this.state = {
      WIF: '',
      ABCAddress: '',
      BCHNAddress:'',
      errMsg: '',
      txId: '',
      showScan: false,
      inFetch: false
    }

  }

  render() {
    return (
      <>
        <Content>
          <Row>
            <Col sm={2} />
            <Col sm={8}>
              <Box
                loaded={!_this.state.inFetch}
                className='hover-shadow border-none mt-2'
              >
                <Row>
                  <Col sm={12} className='text-center'>
                    <h1>
                      <FontAwesomeIcon
                        className='title-icon'
                        size='xs'
                        icon='paper-plane'
                      />
                      <span>Split</span>
                    </h1>
                    <p>Split your BCH and SLP tokens between the BCHN and ABC chains</p>
                    <Box className='border-none'>
                      <Text
                        id='WIF'
                        name='WIF'
                        placeholder='Enter A Private Key (WIF)'
                        label='Private Key (WIF)'
                        labelPosition='above'
                        onChange={_this.handleUpdate}
                        className='title-icon'
                        value={_this.state.WIF}
                        buttonRight={
                          <Button
                            icon='fa-qrcode'
                            onClick={_this.handleModal}
                          />
                        }
                      />

                      <Text
                        id='ABCAddress'
                        name='ABCAddress'
                        placeholder='Enter ABC Address'
                        label='ABC Address'
                        labelPosition='above'
                        onChange={_this.handleUpdate}
                      />
                      <Text
                        id='BCHNAddress'
                        name='BCHNAddress'
                        placeholder='Enter BCHN Address'
                        label='BCHN Address'
                        labelPosition='above'
                        onChange={_this.handleUpdate}
                      />
                      <Button
                        text='Split'
                        type='primary'
                        className='btn-lg'
                        onClick={_this.handleSplit}
                      />
                    </Box>
                  </Col>
                  <Col sm={12} className='text-center'>
                    {_this.state.errMsg && (
                      <p className='error-color'>{_this.state.errMsg}</p>
                    )}
                    {_this.state.txId && (
                      <a
                        target='_blank'
                        rel="noopener noreferrer"
                        href={`https://explorer.bitcoin.com/bch/tx/${_this.state.txId}`}
                      >
                        Transaction ID: {_this.state.txId}
                      </a>
                    )}
                  </Col>
                </Row>
              </Box>
            </Col>
            <Col sm={2} />
          </Row>
          <ScannerModal
            show={_this.state.showScan}
            handleOnHide={_this.onHandleToggleScanner}
            handleOnScan={_this.onHandleScan}
          />
        </Content>
      </>
    )
  }

  handleUpdate(event) {
    const value = event.target.value
    _this.setState({
      [event.target.name]: value
    })
  }

  async handleSplit(event) {
    console.log('event: ', event)
  }

  // Reset form and component state
  resetValues() {
    _this.setState({
      address: '',
      amountSat: '',
      errMsg: '',
      inFetch: false
    })
    const amountEle = document.getElementById('amountToSend')
    amountEle.value = ''

    const wifEle = document.getElementById('WIF')
    wifEle.value = ''
  }

  validateInputs() {
    const { address, amountSat } = _this.state
    const amountNumber = Number(amountSat)

    if (!address) {
      throw new Error('Address is required')
    }

    if (!amountSat) {
      throw new Error('Amount is required')
    }

    if (!amountNumber) {
      throw new Error('Amount must be a number')
    }

    if (amountNumber < 0) {
      throw new Error('Amount must be greater than zero')
    }
  }

  onHandleToggleScanner() {
    _this.setState({
      showScan: !_this.state.showScan
    })
  }

  handleModal() {
    _this.setState({
      showScan: !_this.state.showScan
    })
  }

  resetWIFValue() {
    _this.setState({
      WIF: '',
      errMsg: ''
    })
    const wifEle = document.getElementById('WIF')
    wifEle.value = ''
  }

  onHandleScan(data) {
    try {
      _this.resetWIFValue()
      if (!data) {
        throw new Error('No Result!')
      }
      if (typeof data !== 'string') {
        throw new Error('It should scan a bch address or slp address')
      }
      // Validate Input
      const isWIF = _this.validateWIF(data)
      if (!isWIF) {
        throw new Error('Not a WIF key')
      }
      _this.setState({
        WIF: data,
        errMsg: ''
      })

      _this.onHandleToggleScanner()
    } catch (error) {
      _this.onHandleToggleScanner()
      _this.setState({
        errMsg: error.message
      })
    }
  }

  handleError(error) {
    // console.error(error)
    let errMsg = ''
    if (error.message) {
      errMsg = error.message
    }
    if (error.error) {
      if (error.error.match('rate limits')) {
        errMsg = (
          <span>
            Rate limits exceeded, increase rate limits with a JWT token from
            <a
              style={{ marginLeft: '5px' }}
              target='_blank'
              href='https://fullstack.cash'
              rel='noopener noreferrer'
            >
              FullStack.cash
            </a>
          </span>
        )
      } else {
        errMsg = error.error
      }
    }
    _this.setState(prevState => {
      return {
        ...prevState,
        errMsg,
        txId: '',
        inFetch: false
      }
    })
  }
  validateWIF(WIF) {
    if (typeof WIF !== 'string') {
      return false
    }

    if (WIF.length !== 52) {
      return false
    }

    if (WIF[0] !== 'L' && WIF[0] !== 'K') {
      return false
    }

    return true
  }
}


export default Split
