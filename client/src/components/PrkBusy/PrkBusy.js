// This material was prepared as an account of work sponsored by an agency of the United
// States Government. Neither the United States Government nor the United States
// Department of Energy, nor Battelle, nor any of their employees, nor any jurisdiction or
// organization that has cooperated in the development of these materials, makes any
// warranty, express or implied, or assumes any legal liability or responsibility for the
// accuracy, completeness, or usefulness or any information, apparatus, product, software,
// or process disclosed, or represents that its use would not infringe privately owned rights.
// Reference herein to any specific commercial product, process, or service by trade name,
// trademark, manufacturer, or otherwise does not necessarily constitute or imply its
// endorsement, recommendation, or favoring by the United States Government or any
// agency thereof, or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the United States Government
// or any agency thereof.
//
//                      PACIFIC NORTHWEST NATIONAL LABORATORY
//                                   operated by
//                                     BATTELLE
//                                     for the
//                        UNITED STATES DEPARTMENT OF ENERGY
//                         under Contract DE-AC05-76RL01830
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";
import { connect } from "react-redux";
import { Modal, CircularProgress } from "@material-ui/core";
import { BUSY_GLOBAL, selectBusyTokens } from "controllers/busy/action";

const isBusy = busy => {
  const count = busy
    ? Object.values(busy).filter(v => v.type === BUSY_GLOBAL).length
    : 0;
  return count > 0;
};

class PrkBusy extends React.Component {
  static defaultProps = {
    busy: false
  };

  render() {
    const { classes, busy } = this.props;
    return (
      busy && (
        <Modal open={busy} className={classes.modal}>
          <CircularProgress className={classes.progress} />
        </Modal>
      )
    );
  }
}

PrkBusy.propTypes = {
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  busy: isBusy(selectBusyTokens(state))
});

export default connect(mapStateToProps)(withStyles(styles)(PrkBusy));
