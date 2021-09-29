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
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";
import { connect } from "react-redux";
import { AppBar, Snackbar, IconButton } from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { error } from "constants/palette";
import { clearError, selectErrorTokens } from "controllers/error/action";

class PrkFooter extends React.Component {
  handleClear = key => () => {
    this.props.clearError(key);
  };

  render() {
    const { classes, errors } = this.props;
    const key =
      errors &&
      Object.keys(errors)
        .filter(k => !errors[k].cleared)
        .sort((a, b) => errors[a].timestamp - errors[b].timestamp)
        .find(() => true);
    const token = errors && key && errors[key];
    return (
      <React.Fragment>
        <AppBar position="fixed" color="primary" className={classes.root} />
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          ContentProps={{ style: { background: error } }}
          open={token !== null && token !== undefined}
          autoHideDuration={Math.min(
            Math.max(
              (token && token.error ? token.error.length : 0) * 100,
              5000
            ),
            15000
          )}
          onClose={this.handleClear(key)}
          message={token && token.error}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="clear"
                color="inherit"
                onClick={this.handleClear(key)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  errors: selectErrorTokens(state)
});

const mapActionToProps = {
  clearError
};

export default connect(
  mapStateToProps,
  mapActionToProps
)(withStyles(styles)(PrkFooter));
