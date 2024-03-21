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

import "mapbox-gl/dist/mapbox-gl.css";

import { Grid, IconButton, Typography } from "@material-ui/core";
import ReactMapGL, { GeolocateControl, Popup, ScaleControl } from "react-map-gl";
import { capitalize, debounce, get, isArray, isEqual, isNumber, isString } from "lodash";
import { fetchMapStyle, selectMapStyle } from "controllers/map/action";
import { fetchPreference, selectPreference, updatePreference } from "../../controllers/preference/action";
import { selectLoginUser, selectUser } from "controllers/user/action";

import { Close as CloseIcon } from "@material-ui/icons";
import { PrkControl } from "components";
import React from "react";
import { vehicle as VehicleType } from "parking-common";
import clsx from "clsx";
import { connect } from "react-redux";
import { isTrue } from "../../utils/utils";
import moment from "moment";
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

class PrkMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = {
      width: 0,
      height: 0,
      viewport: {
        latitude: 47.61344885026525,
        longitude: -122.34430506224587,
        zoom: 15.0,
        bearing: 0,
        pitch: 0,
      },
      mapStyle: props.mapStyle,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.querySourceData = this.querySourceData.bind(this);
    this.querySourceDataDebounced = debounce(this.querySourceData, 500);
  }

  isLogin = isTrue(process.env.REACT_APP_LOGIN);
  isAuthenticate = isTrue(process.env.REACT_APP_AUTHENTICATE);
  isPredictions = isTrue(process.env.REACT_APP_PREDICTIONS);

  static getDerivedStateFromProps(props, state) {
    if (!state.mapStyle && props.mapStyle) {
      return { mapStyle: props.mapStyle };
    }
    return null;
  }

  componentDidMount() {
    const { fetchMapStyle } = this.props;
    this.props.fetchPreference();
    fetchMapStyle();
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    const intid = window.setInterval(this.querySourceDataDebounced, parseInt(process.env.REACT_APP_POLLING));
    this.setState({ intid });
  }

  componentWillUnmount() {
    const { intid } = this.state;
    window.clearInterval(intid);
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  templateFormat = (template, props) => {
    return template.replace(/{([^{}]+)}/g, (v, k) => get(props, k, `{${k}}`));
  };

  querySourceData() {
    if (this.map && this.map.current) {
      const { viewport } = this.state;
      const { user, preference } = this.props;
      const { longitude, latitude, zoom } = viewport;
      const preferences = (this.isLogin && user ? user.preferences : preference) || {};
      const predict = this.isPredictions && get(preferences, "predictions", false);
      const m = this.map.current.getMap();
      if (m && m.getStyle) {
        const bounds = m.getBounds();
        const availability = get(preferences, "availability", 5);
        const requirement = get(preferences, "requirement", 20);
        const vehicle = get(preferences, "vehicle", VehicleType.Passenger.label);
        const deferred = get(preferences, "deferred", 8);
        const uuid = moment().valueOf();
        const params = {
          x: longitude,
          y: latitude,
          z: zoom,
          n: bounds._ne.lat,
          e: bounds._ne.lng,
          s: bounds._sw.lat,
          w: bounds._sw.lng,
          r: requirement,
          a: availability,
          v: vehicle,
          d: deferred,
          latitude,
          longitude,
          zoom,
          bounds: [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat],
          requirement,
          availability,
          vehicle,
          deferred,
          uuid
        };
        ["occupancies", "spaces", "clustered"].forEach((s) => {
          const source = m.getSource(s);
          let url = source._options.data;
          url = this.templateFormat(url, params);
          if (s === "occupancies") {
            if (predict) {
              url = url.replace("occupancies", "predictions");
            }
          }
          source.setData(url);
        });
      }
    }
  }

  transformRequest = (url, resourceType) => {
    const { auth } = this.props;
    switch (resourceType) {
      case "Source":
      case "Style":
      case "Tile":
      case "Glyphs":
        return {
          url: url,
          redirect: "manual",
          ...(this.isAuthenticate
            ? {
                credentials: "include",
                headers: {
                  Authorization: `Token ${auth}`,
                  "Cache-Control": "no-store",
                },
              }
            : {
                headers: {
                  "Cache-Control": "no-store",
                },
              }),
        };
      default:
        return {
          url: url,
        };
    }
  };

  handleChange = (key) => (value) => {
    const { viewport } = this.state;
    switch (key) {
      case "viewport":
        if (value.zoom !== undefined) {
          let zoom = value.zoom;
          zoom = Math.min(16.5, zoom);
          zoom = Math.max(5.5, zoom);
          if (zoom !== value.zoom && zoom === viewport.zoom && [16.5, 5.5].includes(zoom)) {
            value.latitude = viewport.latitude;
            value.longitude = viewport.longitude;
          }
          value.zoom = zoom;
        }
        this.setState({ [key]: value }, this.querySourceDataDebounced());
        break;
      default:
      // no need to handle all cases
    }
    this.setState({ [key]: value });
  };

  handleLoad = (event) => {
    console.log("Map-GL finished initial loading.");
    this.querySourceDataDebounced();
  };

  handleViewStateChange = () => {
    // hide the popup
    this.setState({ popupInfo: null });
  };

  handleError = (event) => {
    console.error(event);
  };

  handleMapStyle = (event) => {
    this.querySourceDataDebounced();
  };

  handleClick = (event) => {
    this.handleMouseDown(event);
  };

  handleMouseMove = (event) => {
    this.handleMouseDown(event);
  };

  handleMouseDown = (event) => {
    const map = this.map.current && this.map.current.getMap();
    if (map) {
      const features = map.queryRenderedFeatures([event.center.x, event.center.y], {
        // filtering on layers isn't working for some reason
        // layers: ["spaces", "occupied", "available"]
      });
      if (features.length > 0) {
        const feature = features[0];
        const layer = feature.layer.id && feature.layer.id.split("-")[0];
        switch (layer) {
          case "spaces":
          case "indeterminate":
          case "available":
          case "unknown":
          case "occupied":
            const popupInfo = {
              longitude: event.lngLat[0],
              latitude: event.lngLat[1],
              layer: layer,
              properties: feature.properties,
            };
            Object.keys(popupInfo.properties).forEach(
              (key) =>
                (popupInfo.properties[key] =
                  popupInfo.properties[key] === "null"
                    ? null
                    : typeof popupInfo.properties[key] === "string"
                    ? popupInfo.properties[key].replace("_", " ")
                    : popupInfo.properties[key])
            );
            this.setState({ popupInfo });
            break;
          default:
        }
      } else {
        this.setState({ popupInfo: null });
      }
    }
  };

  isAuthenticated = () => {
    const { auth } = this.props;
    const { mapStyle } = this.state;
    return (this.isAuthenticate ? auth : true) && mapStyle;
  };

  renderPopup() {
    const { classes, user, preference } = this.props;
    const preferences = (this.isLogin && user ? user.preferences : preference) || {};
    const predict = get(preferences, "predictions", false);
    const availability = get(preferences, "availability", 5);
    const { popupInfo } = this.state;
    const {
      state,
      sensors,
      precise,
      current,
      available,
      required,
      shapeLength,
      occupancies,
      occupancy,
      predictions,
      prediction,
      blockId,
      blockfaceId,
      cvlzId,
      spaceType,
      spaceTyped,
    } = popupInfo ? popupInfo.properties : {};
    let total = 0;
    if (isArray(sensors)) {
      total = sensors.length;
    } else if (isNumber(sensors)) {
      total = sensors;
    } else if (isString(sensors)) {
      total = JSON.parse(sensors).length;
    }
    const open = occupancies ? total - occupancy : 0;
    const segment = shapeLength / Math.max(1, total);
    const min = open < total ? segment * Math.ceil(open / 2) : segment * open;
    const max = segment * open;
    const extra = { min: min, max: max };
    if (occupancies && predictions && predict) {
      if (isNumber(prediction)) {
        const po = total - prediction;
        const pmin = po < total ? segment * Math.ceil(po / 2) : segment * po;
        const pmax = segment * po;
        extra.min = pmin;
        extra.max = pmax;
      } else {
        extra.unavailable = true;
      }
    }
    return (
      popupInfo && (
        <Popup
          className={clsx(classes.popup, classes[popupInfo.layer])}
          tipSize={5}
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          closeButton={false}
        >
          <div className={classes.popupHeader}>
            <div className={classes.popupSpacer} />
            <IconButton
              size="small"
              aria-label="clear"
              color="inherit"
              onClick={() => this.setState({ popupInfo: null })}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          {process.env.NODE_ENV === "development" && (
            <React.Fragment>
              <Typography variant="caption">{`${capitalize(blockId)} - ${blockfaceId} - ${cvlzId}`}</Typography>
              <br />
              <Typography variant="caption">{`${open} out of ${total} open`}</Typography>
              <br />
              <Typography variant="caption">{`current: ${current}`}</Typography>
              <br />
              <Typography variant="caption">{`available: ${available}`}</Typography>
              <br />
              <Typography variant="caption">{`prediction: ${prediction}`}</Typography>
              <br />
              <Typography variant="caption">{`required: ${required}`}</Typography>
              <br />
              <Typography variant="caption">{`shapeLength: ${shapeLength}`}</Typography>
              <br />
              <Typography variant="caption">{`state (occupied): ${state}`}</Typography>
              <br />
            </React.Fragment>
          )}
          <Typography>{`${spaceType}: ${spaceTyped}`}</Typography>
          <Typography>{`${Math.round(shapeLength)} ft total length`}</Typography>
          {!occupancies ? (
            <Typography>No occupancy data available</Typography>
          ) : precise ? (
            <Typography>{`${Math.round(current)} ft available now`}</Typography>
          ) : isEqual(min, max) ? (
            <Typography>{`${Math.round(min)} ft available now`}</Typography>
          ) : (
            <Typography>{`${Math.round(min)} to ${Math.round(max)} ft available now`}</Typography>
          )}
          {predict ? (
            !predictions || extra.unavailable ? (
              <Typography>No prediction data available</Typography>
            ) : precise ? (
              <Typography>{`${Math.round(available)} ft available within ${availability} minutes`}</Typography>
            ) : isEqual(extra.min, extra.max) ? (
              <Typography>{`${Math.round(extra.min)} ft available within ${availability} minutes`}</Typography>
            ) : (
              <Typography>{`${Math.round(extra.min)} to ${Math.round(
                extra.max
              )} ft available within ${availability} minutes`}</Typography>
            )
          ) : null}
        </Popup>
      )
    );
  }

  render() {
    const { mapStyle, viewport, width, height } = this.state;
    return (
      <Grid container alignContent="center" justifyContent="center" spacing={0}>
        <Grid item xs={12}>
          {this.isAuthenticated() && (
            <ReactMapGL
              ref={this.map}
              {...viewport}
              width={width}
              height={height}
              mapStyle={mapStyle}
              onViewportChange={this.handleChange("viewport")}
              onViewStateChange={this.handleViewStateChange}
              onLoad={this.handleLoad}
              onError={this.handleError}
              onMapStyle={this.handleMapStyle}
              // onMouseMove={this.handleMouseMove}
              onMouseDown={this.handleMouseDown}
              onClick={this.handleClick}
              transformRequest={this.transformRequest}
              // transitionDuration={1000}
              // transitionInterpolator={new FlyToInterpolator()}
              disableTokenWarning={true}
              mapOptions={{
                userProperties: true,
                customAttribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }}
            >
              {this.renderPopup()}
              <PrkControl
                mapStyle={mapStyle}
                onMapStyle={this.handleChange("mapStyle")}
                onChange={this.querySourceDataDebounced}
              />
              <GeolocateControl
                style={{ position: "absolute", left: ".5em", bottom: ".5em" }}
                // onViewportChange={this.handleChange("viewport")}
                positionOptions={{ enableHighAccuracy: true }}
                // trackUserLocation={true}
                showUserLocation={true}
              />
              <ScaleControl style={{ position: "absolute", left: "3em", bottom: ".5em" }} unit="imperial" />
            </ReactMapGL>
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: selectLoginUser(state),
  mapStyle: selectMapStyle(state),
  preference: selectPreference(state),
  user: selectUser(state),
});

const mapActionToProps = {
  fetchPreference,
  updatePreference,
  fetchMapStyle,
};

export default connect(mapStateToProps, mapActionToProps)(withStyles(styles)(PrkMap));
