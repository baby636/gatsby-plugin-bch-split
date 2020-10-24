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
      BCHNAddress: '',
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
                        value={_this.state.ABCAddress}
                        onChange={_this.handleUpdate}
                      />
                      <Text
                        id='BCHNAddress'
                        name='BCHNAddress'
                        placeholder='Enter BCHN Address'
                        label='BCHN Address'
                        labelPosition='above'
                        value={_this.state.BCHNAddress}
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
  componentDidMount() {
    _this.populateAddress()
  }

  // Populate the ABC address with the web wallet address, if the mnemonic for
  // the address has already been generated.
  populateAddress() {
    const { walletInfo } = _this.props
    const { mnemonic, cashAddress } = walletInfo
    if (mnemonic && cashAddress) {
      _this.setState({
        ABCAddress: cashAddress
      })
    }
    debugger
  }

  async handleSplit() {
    try {
      _this.validateInputs()

      // Turn on spinner
      _this.setState({
        inFetch: true,
        errMsg: ''
      })

      /*
      *
      * Split
      *
      *
      * */
      // Get Wallet Info
      const walletInfo = getWalletInfo()
      const slpAddress = walletInfo.slpAddress
      const WIFFromReceiver = walletInfo.privateKey

      if (!slpAddress || !WIFFromReceiver) {
        throw new Error(
          'You need to have a registered wallet to make a token sweep'
        )
      }

      const SplitLib = typeof window !== 'undefined' ? window.BchSplit : null
      if (!SplitLib) throw new Error('Splitting Library not found')

      // Instancing the library
      const splitLib = new SplitLib(paperWIF, WIFFromReceiver)
      await splitLib.getBlockchainData()

      console.log(`ABC address: ${this.ABCAddress}`)
      console.log(`BCHN address: ${this.BCHNAddress}`)

      // Constructing the sweep transaction
      const transactionHex = await splitLib.splitCoins(this.ABCAddress, this.BCHNAddress)
      console.log(`transactionHex: `, transactionHex)


      _this.resetValues()


    } catch (error) {
      _this.handleError(error)
    }
  }

  handleUpdate(event) {
    const value = event.target.value
    _this.setState({
      [event.target.name]: value
    })
  }



  // Reset form and component state
  resetValues() {
    _this.setState({
      BCHNAddress: '',
      ABCAddress: '',
      WIF: '',
      errMsg: '',
      inFetch: false
    })

  }

  validateInputs() {
    const { WIF, ABCAddress, BCHNAddress } = _this.state

    if (!WIF) {
      throw new Error('WIF is required')
    }

    if (!ABCAddress) {
      throw new Error('ABC Address is required')
    }
    if (!BCHNAddress) {
      throw new Error('BCHN Address is required')
    }

    const isWIF = _this.validateWIF(WIF)
    if (!isWIF) {
      throw new Error('Private Key ( WIF ) has a wrong format ')
    }

    const isABCAddress = _this.validateAddress(ABCAddress)
    if (!isABCAddress) {
      throw new Error('ABC Address  has wrong format ')
    }

    const isBCHNAddress = _this.validateAddress(BCHNAddress)
    if (!isBCHNAddress) {
      throw new Error('BCHN Address  has wrong format ')
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

  validateAddress(address) {
    let isValid = false
    const isBch = address.match('bitcoincash:')
    const isSlp = address.match('simpleledger:')

    if (isBch || isSlp) {
      isValid = true
    }

    return isValid
  }
}

Split.propTypes = {
  walletInfo: PropTypes.object,
}

export default Split
