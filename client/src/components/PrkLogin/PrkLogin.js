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
import { TextField, Grid, Tabs, Tab } from "@material-ui/core";
import { PrkDialog, PrkTheme, PrkFooter } from "components";
import {
  continueUser,
  loginUser,
  selectLoginUser
} from "controllers/user/action";
import { createUser, selectCreateUser } from "controllers/users/action";

class PrkLogin extends React.Component {
  state = {
    tab: 0,
    email: "",
    password: "",
    confirm: ""
  };

  componentDidMount() {
    const { continueUser } = this.props;
    continueUser();
  }

  validate = () => {
    const { email, password, confirm, tab } = this.state;
    switch (tab) {
      case 0:
        return email && password;
      case 1:
        return email && password && password === confirm;
      default:
        return false;
    }
  };

  handleLogin = () => {
    if (this.validate()) {
      const { email, password } = this.state;
      this.props.loginUser({
        email: email,
        password: password
      });
      this.setState({
        password: "",
        confirm: ""
      });
    }
  };

  handleCreate = () => {
    if (this.validate()) {
      const { email, password } = this.state;
      this.props.createUser({
        email: email,
        password: password
      });
      this.setState({
        tab: 0,
        password: "",
        confirm: ""
      });
    }
  };

  handleGuest = () => {
    this.props.loginUser({
      email: "guest.parking@pnnl.gov",
      password: "guest"
    });
    this.setState({
      password: "",
      confirm: ""
    });
  };

  handleChange = key => (event, value) => {
    this.setState({
      [key]: event.target && event.target.value ? event.target.value : value
    });
  };

  handleRef = ref => {
    this.dialog = ref;
  };

  buttons = () => {
    const { tab } = this.state;
    switch (tab) {
      case 0:
        return [
          {
            label: "Sign In",
            disabled: !this.validate(),
            variant: "contained",
            onClick: this.handleLogin
          },
          {
            label: "Continue as Guest",
            disabled: false,
            variant: "text",
            onClick: this.handleGuest
          }
        ];
      case 1:
        return [
          {
            label: "Submit",
            disabled: !this.validate(),
            variant: "contained",
            onClick: this.handleCreate
          }
        ];
      default:
        return [];
    }
  };

  render() {
    const { classes, auth } = this.props;
    const { email, password, confirm, tab } = this.state;
    if (auth) {
      return null;
    }
    return (
      <PrkTheme>
        <PrkDialog
          fullScreen={false}
          fullWidth={true}
          open={!auth}
          title={""}
          buttons={this.buttons()}
        >
          <form className={classes.form} noValidate autoComplete="off">
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Tabs value={tab} onChange={this.handleChange("tab")}>
                  <Tab label="Sign In" value={0} />
                  <Tab label="New Account" value={1} />
                </Tabs>
              </Grid>
              <Grid item xs={12} className={classes.padding} />
              <Grid item xs={12}>
                <TextField
                  id="email"
                  label="Login Email"
                  className={classes.text}
                  value={email}
                  onChange={this.handleChange("email")}
                  margin="none"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="password"
                  label="Password"
                  className={classes.text}
                  value={password}
                  onChange={this.handleChange("password")}
                  type="password"
                  margin="none"
                />
              </Grid>
              {tab === 1 && (
                <Grid item xs={12}>
                  <TextField
                    id="confirm"
                    label="Confirm Password"
                    className={classes.text}
                    value={confirm}
                    onChange={this.handleChange("confirm")}
                    type="password"
                    margin="none"
                  />
                </Grid>
              )}
              <Grid item xs={12} className={classes.padding} />
            </Grid>
          </form>
        </PrkDialog>
        <PrkFooter />
      </PrkTheme>
    );
  }
}

const mapStateToProps = state => ({
  auth: selectLoginUser(state),
  created: selectCreateUser(state)
});

const mapActionToProps = {
  continueUser,
  loginUser,
  createUser
};

export default connect(
  mapStateToProps,
  mapActionToProps
)(withStyles(styles)(PrkLogin));
