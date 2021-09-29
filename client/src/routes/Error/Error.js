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
import { SnackbarContent } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@material-ui/icons";
import clsx from "clsx";
import _ from "lodash";
import PropTypes from "prop-types";
import queryString from "query-string";
import React from "react";
import { withRouter } from "react-router-dom";
import styles from "./styles";

const icons = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

class Error extends React.Component {
  state = {
    message: "",
  };

  static defaultProps = {
    variant: "error",
    label: "Parking has encountered an error.",
  };

  componentDidMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    if (!_.isEmpty(query.message)) {
      this.setState({ message: query.message });
    }
  }

  render() {
    const { variant, label, classes } = this.props;
    const { message } = this.state;
    const Icon = icons[variant];
    return (
      <div className={clsx(classes.center, classes.pad)}>
        <SnackbarContent
          className={clsx(classes[variant], classes.snackbar)}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {label}
              <br />
              {message}
            </span>
          }
        />
      </div>
    );
  }
}

Error.propTypes = {
  variant: PropTypes.oneOf(["success", "warning", "error", "info"]),
};

export default withRouter(withStyles(styles)(Error));
