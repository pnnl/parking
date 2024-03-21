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
import { Paper, Typography, Button } from "@material-ui/core";
import { AccountCircle as AccountCircleIcon } from "@material-ui/icons";
import { logoutUser, selectUser } from "controllers/user/action";

class PrkHeader extends React.Component {
  findUsername = () => {
    const { user } = this.props;
    if (!user) {
      return "Unknown";
    } else if (user.scope === "") {
      return "";
    } else {
      return user.email;
    }
  };

  findButtonText = () => {
    const { user } = this.props;
    if (!user) {
      return "Sign In";
    } else if (user.scope === "") {
      return "Sign in for Predictions";
    } else {
      return "Log Out";
    }
  };

  handleLogout = () => {
    this.props.logoutUser();
  };

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <div className={classes.space} />
        <AccountCircleIcon className={classes.icon} />
        <Typography variant="body1" className={classes.title}>
          {this.findUsername()}
        </Typography>
        <Button
          variant="text"
          size="small"
          className={classes.button}
          onClick={this.handleLogout}
        >
          {this.findButtonText()}
        </Button>
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  user: selectUser(state)
});

const mapActionToProps = {
  logoutUser
};

export default connect(
  mapStateToProps,
  mapActionToProps
)(withStyles(styles)(PrkHeader));
