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
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  withWidth,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { selectUser } from "controllers/user/action";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { routes } from "routes";
import PrkLink from "./PrkLink";
import styles from "./styles";

const NavigationPrkLink = (label) =>
  React.forwardRef((props, ref) => {
    return (
      <PrkLink {...props} aria-label={label} ref={ref}>
        {props.children}
      </PrkLink>
    );
  });

class PrkNavigation extends React.Component {
  constructor(props) {
    super(props);

    const { page } = props;
    this.home = page && page.path === "/";
    this.state = {
      open: true,
      windowWidth: window.innerWidth,
    };
  }

  handleChange = (key) => (event, value) => {
    switch (key) {
      default:
        this.setState({ [key]: value });
    }
  };

  render() {
    const { classes, page, user } = this.props;
    const { open } = this.state;
    const name = page && page.name;
    const temp = routes.filter(
      (route) =>
        !route.hidden &&
        (!route.admin || (route.admin && user && user.CanEditAccounts))
    );
    const navWidth = page.indent ? 200 : 50;
    const indentWidth = page.indent ? 250 : 70;
    return (
      <Drawer
        className={classes.drawer}
        style={{ width: `${indentWidth - 20}px` }}
        variant="persistent"
        anchor="left"
        open={open}
        PaperProps={{ style: { width: `${navWidth}px`, overflow: "hidden" } }}
      >
        <div className={classes.toolbar} />
        <List component="nav" className={classes.list}>
          {temp.map((route) => {
            const PrkIcon = route.icon;
            const selected = route.name === name;
            return (
              <ListItem
                button
                disableGutters
                className={clsx(
                  selected
                    ? classes.listItemSelected
                    : classes.listItemNotSelected
                )}
                key={`list-item-${route.name}`}
                component={NavigationPrkLink(route.label)}
                to={route.path}
                onClick={this.handleChange("route")}
              >
                <React.Fragment>
                  <Tooltip title={route.label}>
                    <ListItemIcon key={`list-item-icon-${route.name}`}>
                      <PrkIcon color={selected ? "primary" : "inherit"} />
                    </ListItemIcon>
                  </Tooltip>
                </React.Fragment>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    );
  }
}

PrkNavigation.propTypes = {
  page: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: selectUser(state),
});

const mapActionToProps = {};

export default connect(
  mapStateToProps,
  mapActionToProps
)(withWidth()(withStyles(styles)(PrkNavigation)));
