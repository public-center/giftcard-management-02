import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

@connect(
  state => ({
    employee: state.employee
  }), {

  })
export class Receipt extends Component {
  static propTypes = {
    test: PropTypes.string
  };

  constructor() {
    super();
    this.rejectionHistoryConfirm = ::this.rejectionHistoryConfirm;
    this.systemTime = ::this.systemTime;
    this.fixLqApiCustomerCompany = ::this.fixLqApiCustomerCompany;
  }

  rejectionHistoryConfirm() {

  }

  systemTime() {

  }

  fixLqApiCustomerCompany() {

  }

  render() {
    console.log('**************RENDER**********');
    console.log(this.props);
    return (
      <div className="row">
        <div className="col-md-12">
          <table>
            <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Store Name</th>
              <th>Sale Total</th>
              <th>Balance Total</th>
            </tr>
            <tr>
              <th>
                <input className="input-sm form-control" type="search"/>
              </th>
              <th>
                <input className="input-sm form-control" type="search"/>
              </th>
              <th>
                <input className="input-sm form-control" type="search"/>
              </th>
              <th>
                <input className="input-sm form-control" type="search"/>
              </th>
              <th>
                <input className="input-sm form-control" type="search"/>
              </th>
            </tr>
            </thead>
            <tbody>

            </tbody>
            <tfoot>
            <tr>

            </tr>
            </tfoot>
          </table>

        </div>
      </div>
    );
  }
}
