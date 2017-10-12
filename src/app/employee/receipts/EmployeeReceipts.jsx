import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Immutable from 'immutable';
import moment from 'moment';
import ReactTable from 'react-table';

import {getReceipts, setGetFilter} from 'reducers/reducers/receipts';

const delayRequest = 500;

const columns = [
  {
    Header: 'Date',
    accessor: 'created',
  },
  {
    Header: 'Customer',
    accessor: 'customer.fullName'
  },
  {
    Header: 'Store',
    accessor: 'store.name'
  },
  {
    Header: 'Sale Total',
    accessor: 'saleTotal'
  },
  {
    Header: 'Balance Total',
    accessor: 'balanceTotal'
  }
];

@connect(
  state => ({
    receipts: state.receipts,
    user: state.user.get('user')
  }), {
    getReceipts,
    setGetFilter
  })
export class EmployeeReceipts extends Component {
  static propTypes = {
    receipts: PropTypes.instanceOf(Immutable.Map),
    getReceipts: PropTypes.func,
    user: PropTypes.instanceOf(Immutable.Map),
    goToReceipt: PropTypes.func,
    setGetFilter: PropTypes.func
  };

  componentDidMount() {
    this.filterOnChange = ::this.filterOnChange;
    this.getReceipts(this.props.user, this.props.receipts.get('getFilter'));
  }

  /**
   * Given a user, call the receipts endpoint with the right params.
   * It might make sense to abstract this function with child classes in the future.
   *
   * @param {Immutable.Map} user
   * @param {Immutable.Map} params
   */
  getReceipts(user, params) {
    const {getReceipts} = this.props;
    if (user.get('role') === 'corporate-admin') {
      getReceipts('company', user.getIn(['company', '_id']), params);
    } else {
      getReceipts('store', user.getIn(['store', '_id']), params);
    }
  }

  /**
   * Updates the search filter
   *
   * @param {Object} event
   */
  async filterOnChange(event) {
    const {name, value} = event.target;
    const {setGetFilter} = this.props;

    await setGetFilter({[name]: value});

    const {user, receipts} = this.props;

    if (this.pendingRequest) {
      clearTimeout(this.pendingRequest);
    }

    this.pendingRequest = setTimeout(() => {
      this.getReceipts(user, receipts.get('getFilter'));
      this.pendingRequest = null;
    }, delayRequest);
  }

  /**
   * Go to a specific receipt
   * @param receipt
   */
  goToReceipt(receipt) {
    const {user, goToReceipt} = this.props;
    const userRole = user.get('role');
    goToReceipt(receipt.get('_id'), userRole);
  }

  render() {
    const receipts = this.props.receipts.get('receipts', Immutable.List());

    return (
      <div className="row">
        <div className="col-md-12">
          <ReactTable
            data={receipts.toJS()}
            columns={columns}
            className="-striped -highlight"
          />
        </div>
      </div>
    );
  }
}
