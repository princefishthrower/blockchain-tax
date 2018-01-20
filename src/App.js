import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import BurgerMenu from 'react-burger-menu';
import { Input, Button, Icon, Popup, Label, Table } from 'semantic-ui-react'

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const sideChanged = this.props.children.props.right !== nextProps.children.props.right;

    if (sideChanged) {
      this.setState({hidden : true});

      setTimeout(() => {
        this.show();
      }, this.props.wait);
    }
  }

  show() {
    this.setState({hidden : false});
  }

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className={this.props.side}>
        {this.props.children}
      </div>
    );
  }
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      currentMenu: 'scaleRotate',
      side: 'left',
      ethereumAddress: '',
      loadingEthereum: false,
      ethereumTransactions: [],
      iTransactionCount: '',
      showTransactionLabel: false
    };
    this.getItems = this.getItems.bind(this);
    this.onEthereumInputChange = this.onEthereumInputChange.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
  }

  getItems() {
    let items = [
          <h2 key="0"><i className="fa fa-fw fa-cubes fa-2x" /><span>BlockchainTax</span></h2>,
          <a key="1" href=""><i className="fa fa-fw fa-gears" /><span>Settings</span></a>,
          <a key="1" href=""><i className="fa fa-fw fa-money" /><span>How are my taxes Calculated?</span></a>,
          <a key="5" href=""><i className="fa fa-fw fa-list" /><span>Credits</span></a>,
          <a key="6" href="https://blog.request.network/request-network-project-update-january-19th-2018-announcing-a-30-million-request-fund-6a6f87d27d43"><i className="fa fa-fw fa-external-link" /><span>BlockchainTax won a grant under Request Network's Request Fund!</span></a>
        ];
    return items;
  }

  onEthereumInputChange(event) {
    this.setState({ethereumAddress: event.target.value});
  }

  getTransactions() {
    var aTransactions, oDate, sLocaleDateTime, sValue, iTransactionCount;
    var aCleanTransactions = [];
    var that = this;
    this.setState({loadingEthereum: true}); // set input to loading
    axios.get("http://api.etherscan.io/api?module=account&action=txlist&address=" + this.state.ethereumAddress + "&startblock=0&endblock=99999999&sort=asc&apikey=D5VZY7FYF3JZA1IZPTNV6ZCC34YIG29Q28")
      .then(function (response) {
        console.log(response);
        aTransactions = response.data.result;
        aTransactions.forEach((oTransaction) => {
          console.log(oTransaction.timeStamp);
          oDate = new Date(oTransaction.timeStamp*1000); // convert UNIX timestamp
          sLocaleDateTime = oDate.toLocaleDateString() + " " + oDate.toLocaleTimeString(); // date to human readable string
          sValue = (parseFloat(oTransaction.value) / 1000000000000000000).toString(); // TODO: include bignumber.js?
          aCleanTransactions.push({amount: sValue, to: oTransaction.to, time: sLocaleDateTime})
        });
        iTransactionCount = aCleanTransactions.length;
        that.setState({loadingEthereum: false, ethereumTransactions: aCleanTransactions, ethereumTransactionCount: iTransactionCount, showTransactionLabel: true});
      })
      .catch(function (error) {
        console.log(error);
        that.setState({loadingEthereum: false});
      });
  }

  buildAddressInputs() {
    const transactionTable = this.buildTable();
    let addressInputs = (
      <div>
        <Input placeholder='ETH Address...' className="input__wide" loading={this.state.loadingEthereum} icon={<Icon name='clone' link/>} value={this.state.ethereumAddress} onChange={this.onEthereumInputChange}/>
        <Button primary onClick={this.getTransactions}>
          <Icon name='checkmark' />
          Go!
        </Button>
        { this.state.showTransactionLabel && <Popup
            trigger={<Label color='green' horizontal>{this.state.ethereumTransactionCount} Transactions Found</Label>}
            header="Transactions"
            content={transactionTable}
            hoverable={true}
          /> }
        <br/>
      </div>
    );
    return addressInputs;
  }

  buildAddAddressButtons() {
    let addAddressButtons = (
      <div>
        <Button secondary>
          <Icon name='bitcoin' />
          BTC
        </Button>
        <Button secondary>
          <Icon name='euro' />
          ETH
        </Button>
        <Button secondary>
          <Icon name='dollar' />
          LTC
        </Button>
      </div>
    )
    return addAddressButtons;
  }

  buildTable() {
    if (this.state.ethereumTransactions.length === 0) {
      return;
    }
    let rows = [];
    // build table for popup
    this.state.ethereumTransactions.forEach((oTransaction) => {
      rows.push(
        <Table.Row>
          <Table.Cell>{oTransaction.amount}</Table.Cell>
          <Table.Cell>{oTransaction.to}</Table.Cell>
          <Table.Cell>{oTransaction.time}</Table.Cell>
        </Table.Row>
      );
    });
    let transactionTable = (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>To</Table.HeaderCell>
            <Table.HeaderCell>Date & Time</Table.HeaderCell>
            <Table.HeaderCell>Cost at Transaction Time (USD)</Table.HeaderCell>
            <Table.HeaderCell>Tax Incurred</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    );
    return transactionTable;
  }

  render() {
    const Menu = BurgerMenu[this.state.currentMenu];
    const items = this.getItems();
    const addressInputs = this.buildAddressInputs();
    const addAddressButtons = this.buildAddAddressButtons();

    return (
      <div id="outer-container" style={{height: '100%'}}>
        <MenuWrap wait={20}>
          <Menu id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
            {items}
          </Menu>
        </MenuWrap>
        <main id="page-wrap">
          <h1><a href="https://github.com/frewinchristopher/blockchain-tax"><i className="fa fa-fw fa-cubes fa-2x"/>BlockchainTax <i className="fa fa-fw fa-cubes fa-2x"/></a></h1>
          <h2 className="description">Your one stop app for calculating Blockchain and cryptocurrency asset related taxes.</h2>
          <h2 className="instructions">Enter your cryptocurrency addresses, and have the proper taxes calculated before your eyes.</h2>
          <p>To get started, enter any Ethereum address that you have used to send or reciever Ether:<sup>*</sup></p>
          <br/>
          {addressInputs}
          <Popup
              trigger={<Button secondary>
                <Icon name='plus' />
                Add another address...
              </Button>}
              content={addAddressButtons}
              hoverable={true}
            />
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <sup>*BTC, LTC, and Binance support with ALL of it's trading pairs coming soon!</sup>
        </main>

      </div>
    );
  }
}

export default App;
