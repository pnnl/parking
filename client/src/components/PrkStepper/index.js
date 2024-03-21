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
import { withWidth } from "@material-ui/core";
import { Stepper, Step, StepLabel, Button, Toolbar } from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from "@material-ui/icons";

class PrkStepper extends React.Component {
  static defaultProps = {
    disabled: []
  };

  constructor(props) {
    super(props);
    this.state = {
      step: props.step
    };
  }

  notifyStepChange = step => {
    if (this.props.onStepChange != null) {
      this.props.onStepChange(step);
    }
  };

  handleNext = () => {
    const step = this.state.step + 1;
    this.setState({
      step: step
    });
    this.notifyStepChange(step);
  };

  handleBack = () => {
    const step = this.state.step - 1;
    this.setState({
      step: step
    });
    this.notifyStepChange(step);
  };

  handleReset = () => {
    this.setState({
      step: 0
    });
    this.notifyStepChange(0);
  };

  render() {
    const { steps, disabled, classes, width } = this.props;
    const { step } = this.state;
    var icon = false;
    switch (width) {
      case "xs":
      case "sm":
        icon = true;
        break;
      default:
        icon = false;
    }
    return (
      <Toolbar>
        <Button
          style={{ minWidth: icon ? 16 : 64 }}
          disabled={step === 0 || disabled.indexOf(step - 1) !== -1}
          onClick={this.handleBack.bind(this)}
          color="secondary"
          variant="contained"
        >
          {icon ? <ArrowBackIcon /> : "Back"}
        </Button>
        <Stepper activeStep={step} className={classes.stepper}>
          {steps.map(function(item, index) {
            return (
              <Step key={item.name}>
                <StepLabel>{item.name}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Button
          style={{ minWidth: icon ? 16 : 64 }}
          disabled={
            step === steps.length - 1 || disabled.indexOf(step + 1) !== -1
          }
          onClick={this.handleNext.bind(this)}
          color="secondary"
          variant="contained"
        >
          {icon ? <ArrowForwardIcon /> : "Next"}
        </Button>
      </Toolbar>
    );
  }
}

PrkStepper.propTypes = {
  step: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  disabled: PropTypes.arrayOf(PropTypes.number.isRequired),
  onStepChange: PropTypes.func
};

export default withWidth()(withStyles(styles)(PrkStepper));
