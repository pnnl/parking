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
  AccessTime as AccessTimeIcon,
  AirportShuttle as AirportShuttleIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Remove as RemoveIcon,
} from "@material-ui/icons";
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { cloneDeep, isEqual, isUndefined, range } from "lodash";
import { fetchPreference, selectPreference, updatePreference } from "../../controllers/preference/action";
import { selectUser, updateUser } from "controllers/user/action";

import PropTypes from "prop-types";
import React from "react";
import clsx from "clsx";
import { connect } from "react-redux";
import { isTrue } from "../../utils/utils";
import moment from "moment";
import styles from "./styles";
import { vehicle } from "parking-common";
import { withStyles } from "@material-ui/core/styles";

class PrkControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  isLogin = isTrue(process.env.REACT_APP_LOGIN);
  isMarkers = isTrue(process.env.REACT_APP_MARKERS);
  isPredictions = isTrue(process.env.REACT_APP_PREDICTIONS);
  isDeferred = isTrue(process.env.REACT_APP_DEFERRED);
  isVehicleType = isTrue(process.env.REACT_APP_VEHICLE_TYPE);
  isVehicleLength = isTrue(process.env.REACT_APP_VEHICLE_LENGTH);

  componentDidMount() {
    this.props.fetchPreference();
    this.updateLayoutProperties();
  }

  getLayoutProperty = (id, property) => {
    const { mapStyle } = this.props;
    if (mapStyle) {
      const { layers } = mapStyle;
      const layer = layers.find((layer) => layer.id === id);
      return layer && layer.layout[property];
    }
  };

  setLayoutProperty = (id, property, value) => {
    const { mapStyle, onMapStyle } = this.props;
    if (mapStyle) {
      const updated = JSON.parse(JSON.stringify(mapStyle));
      const { layers } = updated;
      const ids = Array.isArray(id) ? id : [id];
      layers.filter((layer) => ids.includes(layer.id)).forEach((layer) => (layer.layout[property] = value));
      onMapStyle(updated);
    }
  };

  updateLayoutProperties = () => {
    const { mapStyle, onMapStyle, user, preference } = this.props;
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    if (mapStyle) {
      const updated = JSON.parse(JSON.stringify(mapStyle));
      const { layers } = updated;
      [
        {
          id: ["spaces", "spaces-border", "spaces-symbol", "spaces-polygon", "spaces-stroke"],
          property: "visibility",
          value: this.isMarkers && preferences.markers ? "visible" : "none",
        },
        {
          id: "predictions",
          property: "visibility",
          value: this.isPredictions && preferences.predictions ? "visible" : "none",
        },
      ].forEach(({ id, property, value }) => {
        const ids = Array.isArray(id) ? id : [id];
        layers.filter((layer) => ids.includes(layer.id)).forEach((layer) => (layer.layout[property] = value));
      });
      onMapStyle(updated);
    }
  };

  updateUserPreferences = (key, value) => {
    const { user } = this.props;
    if (this.isLogin && user) {
      const { preferences } = user;
      const prev = cloneDeep(preferences);
      const temp = cloneDeep(preferences);
      temp[key] = value;
      this.props.updateUser({ preferences: temp });
      if (!isEqual(prev, temp)) {
        this.props.onChange();
      }
    } else {
      const { preference } = this.props;
      const prev = cloneDeep(preference);
      const temp = cloneDeep(preference);
      temp[key] = value;
      this.props.updatePreference(temp);
      if (!isEqual(prev, temp)) {
        this.props.onChange();
      }
    }
  };

  handleChange = (key) => (event, value) => {
    switch (key) {
      case "markers":
        this.setState({ [key]: value });
        this.setLayoutProperty(
          ["spaces", "spaces-border", "spaces-symbol", "spaces-heatmap"],
          "visibility",
          value ? "visible" : "none"
        );
        this.updateUserPreferences(key, value);
        break;
      case "predictions":
        this.setState({ [key]: value });
        this.setLayoutProperty("predictions", "visibility", value ? "visible" : "none");
        this.updateUserPreferences(key, value);
        break;
      case "availability":
      case "requirement":
      case "vehicle":
      case "deferred":
        // console.log({ key, value: event.target.value });
        // this.setState({ [key]: event.target.value });
        this.updateUserPreferences(key, event.target.value);
        break;
      default:
        this.setState({ [key]: value });
    }
  };

  renderExtraSpaces() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !(user && user.scope && user.scope.includes("user"));
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    return (
      this.isMarkers && (
        <FormControl className={classes.form} component="fieldset">
          <FormGroup aria-label="position">
            <div className={classes.formEntry}>
              <FormControlLabel
                value="markers"
                control={
                  <Switch
                    checked={preferences.markers}
                    color="primary"
                    onChange={this.handleChange("markers")}
                    disabled={guest}
                  />
                }
                label="Display Extra Spaces"
                labelPlacement="end"
              />
              <Tooltip
                title={`Display extra spaces that do not have real time occupancy ${
                  this.isPredictions ? "or prediction " : ""
                }information.`}
              >
                <InfoIcon className={classes.infoIcon} color="primary" />
              </Tooltip>
            </div>
          </FormGroup>
        </FormControl>
      )
    );
  }

  renderPredictions() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !(user && user.scope && user.scope.includes("user"));
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    return (
      this.isPredictions && (
        <FormControl className={classes.form} component="fieldset">
          <FormGroup aria-label="position">
            <div className={classes.formEntry}>
              <FormControlLabel
                value="predictions"
                control={
                  <Switch
                    checked={preferences.predictions}
                    color="primary"
                    onChange={this.handleChange("predictions")}
                    disabled={guest}
                  />
                }
                label="Display Predictions"
                labelPlacement="end"
              />
              <Tooltip title="Length of time in the future to display predicted availability of spaces.">
                <InfoIcon className={classes.infoIcon} color="primary" />
              </Tooltip>
            </div>
            <div className={classes.formEntry}>
              <Select
                className={classes.selectAvailability}
                color="primary"
                value={Boolean(preferences.availability) ? preferences.availability : 5}
                onChange={this.handleChange("availability")}
                disabled={guest || (user && !user.preferences.predictions)}
              >
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
              </Select>
            </div>
          </FormGroup>
        </FormControl>
      )
    );
  }

  renderDeferred() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !user?.scope?.includes("user");
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    const m = moment().startOf("minutes").get("minutes");
    const t = moment()
      .startOf("minutes")
      .set("minutes", Math.floor(m / 15) * 15);
    const k = t.get("hours") * 60 + t.get("minutes");
    return (
      this.isDeferred && (
        <FormControl className={classes.form} component="fieldset">
          <FormGroup aria-label="position">
            <div className={classes.formEntry}>
              <AccessTimeIcon className={classes.timeIcon} color="primary" />
              <Typography className={classes.labelRequirement} variant="body1">
                Time Available
              </Typography>
              <Tooltip title="Specific time of the day to determine availability according to space type.">
                <InfoIcon className={classes.infoIcon} color="primary" />
              </Tooltip>
            </div>
            <div className={classes.formEntry}>
              <Select
                key={`deferred-select-${k}`}
                className={classes.selectDeferred}
                color="primary"
                value={!isUndefined(preferences.deferred) ? preferences.deferred : 0}
                onChange={this.handleChange("deferred")}
                disabled={guest || (user && !user.preferences.deferred)}
                renderValue={(v) =>
                  t
                    .clone()
                    .add(v * 15, "minutes")
                    .format("hh:mm a")
                }
              >
                {range(0, 10).map((v) => {
                  return (
                    <MenuItem key={`deferred-item-${k + v * 15}-${v}`} value={v}>
                      {t
                        .clone()
                        .add(v * 15, "minutes")
                        .format("hh:mm a")}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          </FormGroup>
        </FormControl>
      )
    );
  }

  renderVehicleType() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !(user && user.scope && user.scope.includes("user"));
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    return (
      this.isVehicleType && (
        <FormControl className={classes.form} component="fieldset">
          <FormGroup aria-label="position">
            <div className={classes.formEntry}>
              <AirportShuttleIcon className={classes.truckIcon} color="primary" />
              <Typography className={classes.labelRequirement} variant="body1">
                Vehicle Type
              </Typography>
              <Tooltip title="Vehicle type to determine applicable spots for parking.">
                <InfoIcon className={classes.infoIcon} color="primary" />
              </Tooltip>
            </div>
            <div className={classes.formEntry}>
              <Select
                className={classes.selectRequirement}
                color="primary"
                value={preferences.vehicle ? preferences.vehicle : vehicle.Passenger.label}
                onChange={this.handleChange("vehicle")}
                disabled={guest}
              >
                {/* {vehicle.values().map((v) => (
                  <MenuItem key={v.name} value={v.label}>
                    {v.label}
                  </MenuItem>
                ))} */}
                <MenuItem value={"All"}>All</MenuItem>
                <MenuItem value={vehicle.Passenger.label}>Paid</MenuItem>
                <MenuItem value={vehicle.Commercial.label}>{vehicle.Commercial.label}</MenuItem>
                <MenuItem value={vehicle.Transport.label}>Bus</MenuItem>
              </Select>
            </div>
          </FormGroup>
        </FormControl>
      )
    );
  }

  renderVehicleLength() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !(user && user.scope && user.scope.includes("user"));
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    return (
      this.isVehicleLength && (
        <FormControl className={classes.form} component="fieldset">
          <FormGroup aria-label="position">
            <div className={classes.formEntry}>
              <AirportShuttleIcon className={classes.truckIcon} color="primary" />
              <Typography className={classes.labelRequirement} variant="body1">
                Vehicle Length
              </Typography>
              <Tooltip title="Vehicle length or minimum length of available space required for parking.">
                <InfoIcon className={classes.infoIcon} color="primary" />
              </Tooltip>
            </div>
            <div className={classes.formEntry}>
              <Select
                className={classes.selectRequirement}
                color="primary"
                value={Boolean(preferences.requirement) ? preferences.requirement : 20}
                onChange={this.handleChange("requirement")}
                disabled={guest}
              >
                <MenuItem value={20}>20 feet</MenuItem>
                <MenuItem value={25}>25 feet</MenuItem>
                <MenuItem value={30}>30 feet</MenuItem>
                <MenuItem value={40}>40 feet</MenuItem>
                <MenuItem value={50}>50 feet</MenuItem>
                <MenuItem value={60}>60 feet</MenuItem>
              </Select>
            </div>
          </FormGroup>
        </FormControl>
      )
    );
  }

  renderLegend() {
    const { classes, user, preference } = this.props;
    const guest = this.isLogin && !(user && user.scope && user.scope.includes("user"));
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    return (
      <>
        <div className={classes.formEntry}>
          <ArrowUpwardIcon className={clsx(classes.avatar, classes.arrowUpward)} />
          <Typography className={clsx(classes.avatar, classes.label, classes.labelAvailable)}>
            {guest || !preferences.predictions ? "Parking Available" : "Open parking highly likely"}
          </Typography>
          <Tooltip
            title={
              guest || !preferences.predictions ? (
                <span>
                  <p>Gray: The space does not have real time status available.</p>
                  <p>Green: There is currently enough space available to park.</p>
                  <p>Yellow: There may be enough space available to park.</p>
                  {/* <p>
                    Yellow: The entire space is currently open, but there is not enough total space to park. There may
                    be enough room to park if adjoining sections are open.
                  </p> */}
                  <p>Red: There is currently not enough space available to park.</p>
                </span>
              ) : (
                <span>
                  <p>Gray: The space does not have real time status available.</p>
                  <p>Green: It is likely that enough space will be available to park.</p>
                  <p>
                    Yellow: It is likely that the entire space will be open, but there is not enough total space to
                    park. There may be enough room to park if adjoining sections are open.
                  </p>
                  <p>Red: It is likely that there will not be enough space available to park.</p>
                </span>
              )
            }
          >
            <InfoIcon className={classes.infoIcon} color="primary" />
          </Tooltip>
        </div>
        <div className={classes.formEntry}>
          <RemoveIcon className={clsx(classes.avatar, classes.unknown)} />
          <Typography className={clsx(classes.avatar, classes.label)}></Typography>
        </div>
        <div className={classes.formEntry}>
          <ArrowDownwardIcon className={clsx(classes.avatar, classes.arrowDownward)} />
          <Typography className={clsx(classes.avatar, classes.label)}>
            {guest || !preferences.predictions ? "Parking Unavailable" : "Open parking unlikely"}
          </Typography>
        </div>
      </>
    );
  }

  render() {
    const { classes } = this.props;
    const { expanded } = this.state;
    return (
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardActions className={classes.actions}>
            <Typography variant="body1" className={classes.title}>
              Dynacurb Parking App
            </Typography>
            <IconButton
              className={clsx(classes.icons, classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={(action) => this.handleChange("expanded")(action, !expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent className={classes.content}>
              {this.renderExtraSpaces()}
              {this.renderPredictions()}
              {this.renderDeferred()}
              {this.renderVehicleType()}
              {this.renderVehicleLength()}
              {this.renderLegend()}
            </CardContent>
          </Collapse>
        </Card>
      </div>
    );
  }
}

PrkControl.propTypes = {
  mapStyle: PropTypes.object,
  onMapStyle: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  preference: selectPreference(state),
  user: selectUser(state),
});

const mapActionToProps = {
  fetchPreference,
  updatePreference,
  updateUser,
};

export default connect(mapStateToProps, mapActionToProps)(withStyles(styles)(PrkControl));
