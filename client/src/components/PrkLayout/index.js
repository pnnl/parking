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
import { withTheme } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { PrkBusy, PrkFooter, PrkHeader } from "..";
import { getDocumentHeight, isTrue } from "../../utils/utils";
import styles from "./styles";

class PrkLayout extends React.Component {
  state = { error: null, info: null };

  isLogin = isTrue(process.env.REACT_APP_LOGIN);

  componentDidMount() {
    window.addEventListener("resize", this.updatePageSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updatePageSize);
  }

  componentDidCatch(error, info) {
    this.setState({ error: error, info: info });
  }

  updatePageSize = () => {
    this.forceUpdate();
  };

  render() {
    const { classes, page, theme } = this.props;
    const { error } = this.state;
    if (error) {
      return <Redirect push to={`/error?message=${error.message}`} />;
    }
    const height = getDocumentHeight() - theme.mixins.toolbar.minHeight - 1;
    return (
      <div className={classes.root}>
        {this.isLogin && <PrkHeader page={page} />}
        {/* {name !== "Error" && <PrkNavigation page={page} />} */}
        <div className={classes.content}>
          <div className={classes.toolbar} />
          <div className={clsx(classes.view)} style={{ height: height }}>
            {this.props.children}
          </div>
        </div>
        <PrkFooter />
        <PrkBusy />
      </div>
    );
  }
}

PrkLayout.propTypes = {
  page: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

const mapStateToProps = (state) => ({});

const mapActionToProps = {};

export default connect(mapStateToProps, mapActionToProps)(withTheme(withStyles(styles)(PrkLayout)));
