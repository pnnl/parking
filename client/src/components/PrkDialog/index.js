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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress
} from "@material-ui/core";

class PrkDialog extends React.Component {
  static defaultProps = {
    open: false
  };

  handleClick = button => () => {
    if (button.onClick != null) {
      button.onClick();
    }
  };

  render() {
    const {
      classes,
      title,
      children,
      buttons,
      open,
      busy,
      fullScreen,
      fullWidth
    } = this.props;
    return (
      <Dialog
        fullScreen={fullScreen ? true : false}
        fullWidth={fullWidth ? true : false}
        maxWidth="lg"
        open={open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent className={classes.content}>{children}</DialogContent>
        <DialogActions>
          {busy ? <CircularProgress /> : null}
          {buttons &&
            buttons.map(button => (
              <Button
                key={button.label}
                onClick={this.handleClick(button)}
                variant={button.variant}
                color="primary"
                disabled={button.disabled}
              >
                {button.label}
              </Button>
            ))}
        </DialogActions>
      </Dialog>
    );
  }
}

PrkDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.object.isRequired),
  open: PropTypes.bool.isRequired,
  fullScreen: PropTypes.bool,
  fullWidth: PropTypes.bool
};

export default withStyles(styles)(PrkDialog);
