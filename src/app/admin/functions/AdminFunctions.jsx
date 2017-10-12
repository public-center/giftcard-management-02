import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {makeSelectDomain} from './selectors';
import {rejectionHistoryConfirm, systemTime, fixLqApiCustomerCompany} from 'reducers/reducers/adminFunctions';

class AdminFunctions extends Component {
  constructor(props) {
    super(props);
    this.rejectionHistoryConfirm = ::this.rejectionHistoryConfirm;
    this.systemTime = ::this.systemTime;
    this.fixLqApiCustomerCompany = ::this.fixLqApiCustomerCompany;
  }

  rejectionHistoryConfirm() {
    this.props.onRejectionHistoryConfirm();
  }

  async systemTime() {
    // this.props.onSystemTime();
    // console.log('**************SYSTEM TIME**********');
    // this.props.onSagaTest();
  }

  fixLqApiCustomerCompany() {
    this.props.onFixLqApiCustomerCompany();
  }

  render() {
    const {onRejectionHistoryConfirm, onFixLqApiCustomerCompany, onSystemTime} = this.props;
    return (
      <div className="wrapper wrapper-content animated ">
        <div className="row">
          <div className="col-md-3">
            <button onClick={onRejectionHistoryConfirm}>Fill in rejection history</button>
          </div>
          <div className="col-md-3">
            <button onClick={onSystemTime}>Fill in system time</button>
          </div>
          <div className="col-md-3">
            <button onClick={onFixLqApiCustomerCompany}>Fix LQ API customer company</button>
          </div>
        </div>
      </div>
    );
  }
}

AdminFunctions.propTypes = {
  onFixLqApiCustomerCompany: PropTypes.func,
  onSystemTime: PropTypes.func,
  onRejectionHistoryConfirm: PropTypes.func
};

const mapStateToProps = createStructuredSelector({
  domain: makeSelectDomain()
});

function mapDispatchToProps(dispatch) {
  return {
    onFixLqApiCustomerCompany: () => dispatch(fixLqApiCustomerCompany()),
    onSystemTime: () => dispatch(systemTime()),
    onRejectionHistoryConfirm: () => dispatch(rejectionHistoryConfirm())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminFunctions);
