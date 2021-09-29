import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { PrkDialog } from "components";
import { selectNotice, setNotice } from "controllers/common/action";
import { continueUser } from "controllers/user/action";
import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./styles";

class PrkNotice extends Component {
  componentDidMount() {
    this.props.continueUser();
  }

  handleAcknowledge = () => {
    this.props.setNotice("viewed");
  };

  buttons = () => {
    return [
      {
        disabled: false,
        label: "Acknowledge",
        onClick: this.handleAcknowledge,
        type: "primary",
      },
    ];
  };

  render() {
    const { notice } = this.props;
    if (notice) {
      return null;
    }
    return (
      <PrkDialog
        title={"Commercial Parking App"}
        maxWidth="md"
        open={!notice}
        buttons={this.buttons()}
      >
        <React.Fragment>
          <Typography variant="h6">
            Clicking the acknowledgement button below confirms:
          </Typography>
          <Typography variant="subtitle1">
            • You will not use this webapp while operating a vehicle.
          </Typography>
          <Typography variant="subtitle1">
            • This is an experimental/prototype webapp designed to assist
            commercial drivers in locating available commercial parking spots
            more quickly.
          </Typography>
          <Typography variant="subtitle1">
            • Parking availability predictions are based upon past occupancy
            patterns and no accuracy guarantees are made.
          </Typography>
          <Typography variant="subtitle1">
            • This is not a reservation system and commercial spots are filled
            on a first come, first serve basis.
          </Typography>
          <Typography variant="subtitle1">
            • Authorized use of this webapp is limited to drivers who have
            received prior approval from their employer.
          </Typography>
        </React.Fragment>
      </PrkDialog>
    );
  }
}

const mapStateToProps = (state) => ({
  notice: selectNotice(state),
});

const mapActionToProps = {
  continueUser,
  setNotice,
};

export default connect(
  mapStateToProps,
  mapActionToProps
)(withStyles(styles)(PrkNotice));
