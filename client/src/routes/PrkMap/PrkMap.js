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
import { Grid, Typography } from "@material-ui/core";
import ReactMapGL, { GeolocateControl, Popup } from "react-map-gl";
import {
  fetchMapInfo,
  fetchMapStyle,
  selectMapInfo,
  selectMapStyle,
} from "controllers/map/action";
import { selectLoginUser, selectUser } from "controllers/user/action";

import { PrkControl } from "components";
import React from "react";
import _ from "lodash";
import clsx from "clsx";
import { connect } from "react-redux";
import styles from "./styles";
import { withStyles } from "@material-ui/core/styles";

class PrkMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = {
      width: 0,
      height: 0,
      mapStyle: null,
      viewport: {
        latitude: 47.61344885026525,
        longitude: -122.34430506224587,
        zoom: 15.0,
        bearing: 0,
        pitch: 0,
      },
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    const { fetchMapInfo, fetchMapStyle } = this.props;
    const ref = this;
    fetchMapInfo();
    fetchMapStyle();
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    const map = this.map;
    const intid = window.setInterval(function () {
      if (map.current) {
        const { user } = ref.props;
        const predict = _.get(user, ["preferences", "predictions"], false);
        const m = map.current.getMap();
        const source = m && m.getSource("occupancies");
        if (source) {
          let url = source._data;
          if (predict) {
            url = url.replace("occupancies", "predictions");
            url = url.replace(
              /(?:&availability=\d+)|$/,
              `&availability=${_.get(user, ["preferences", "availability"], 5)}`
            );
          }
          url = url.replace(
            /(?:&requirement=\d+)|$/,
            `&requirement=${_.get(user, ["preferences", "requirement"], 20)}`
          );
          source.setData(url);
        }
      }
    }, 5000);
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
          credentials: "include",
          headers: {
            Authorization: `Token ${auth}`,
            "Cache-Control": "no-store",
          },
        };
      default:
        return {
          url: url,
        };
    }
  };

  handleChange = (key) => (value) => {
    switch (key) {
      case "viewport":
        if (_.has(value, ["zoom"])) {
          let zoom = _.get(value, ["zoom"]);
          zoom = Math.min(16.5, zoom);
          zoom = Math.max(5.5, zoom);
          _.set(value, ["zoom"], zoom);
        }
        this.setState({ [key]: value });
        break;
      default:
      // no need to handle all cases
    }
    this.setState({ [key]: value });
  };

  handleLoad = () => {
    console.log("Map-GL finished initial loading.");
  };

  handleViewStateChange = () => {
    // hide the popup
    this.setState({ popupInfo: null });
  };

  handleError = (event) => {
    console.error(event.error);
  };

  handleMapStyle = (event) => {
    console.log(event);
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
      const features = map.queryRenderedFeatures(
        [event.center.x, event.center.y],
        {
          // filtering on layers isn't working for some reason
          // layers: ["spaces", "occupied", "available"]
        }
      );
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
    const { auth, mapInfo, mapStyle, fetchMapInfo, fetchMapStyle } = this.props;
    if (!mapInfo) {
      fetchMapInfo();
    }
    if (!mapStyle) {
      fetchMapStyle();
    }
    return auth && mapInfo && mapStyle;
  };

  renderPopup() {
    const { classes, user } = this.props;
    const predict = _.get(user, ["preferences", "predictions"], false);
    const availability = _.get(user, ["preferences", "availability"], 5);
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
      spaceTyped,
    } = popupInfo ? popupInfo.properties : {};
    let total = 0;
    if (_.isArray(sensors)) {
      total = sensors.length;
    } else if (_.isNumber(sensors)) {
      total = sensors;
    } else if (_.isString(sensors)) {
      total = JSON.parse(sensors).length;
    }
    const open = occupancies ? total - occupancy : 0;
    const segment = shapeLength / Math.max(1, total);
    const min = open < total ? segment * Math.ceil(open / 2) : segment * open;
    const max = segment * open;
    const extra = { min: min, max: max };
    if (occupancies && predictions && predict) {
      if (_.isNumber(prediction)) {
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
          closeOnClick={true}
          onClose={() => this.setState({ popupInfo: null })}
        >
          {process.env.NODE_ENV === "development" && (
            <React.Fragment>
              <Typography variant="caption">{`${_.capitalize(
                blockId
              )} - ${blockfaceId} - ${cvlzId}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`${open} out of ${total} open`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`current: ${current}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`available: ${available}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`prediction: ${prediction}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`required: ${required}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`shapeLength: ${shapeLength}`}</Typography>
              <br />
              <Typography
                variant="caption"
               
              >{`state (occupied): ${state}`}</Typography>
              <br />
            </React.Fragment>
          )}
          <Typography>{`${_.capitalize(spaceTyped)}`}</Typography>
          <Typography>{`${Math.round(
            shapeLength
          )} ft total length`}</Typography>
          {!occupancies ? (
            <Typography>No occupancy data available</Typography>
          ) : precise ? (
            <Typography>{`${Math.round(current)} ft available now`}</Typography>
          ) : _.isEqual(min, max) ? (
            <Typography>{`${Math.round(min)} ft available now`}</Typography>
          ) : (
            <Typography>{`${Math.round(min)} to ${Math.round(
              max
            )} ft available now`}</Typography>
          )}
          {predict ? (
            !predictions || extra.unavailable ? (
              <Typography>No prediction data available</Typography>
            ) : precise ? (
              <Typography>{`${Math.round(
                available
              )} ft available within ${availability} minutes`}</Typography>
            ) : _.isEqual(extra.min, extra.max) ? (
              <Typography>{`${Math.round(
                extra.min
              )} ft available within ${availability} minutes`}</Typography>
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
    const { mapInfo } = this.props;
    const { viewport, mapStyle, width, height } = this.state;
    return (
      <Grid container alignContent="center" justify="center" spacing={0}>
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
                customAttribution: mapInfo.attribution,
              }}
            >
              {this.renderPopup()}
              <PrkControl
                mapStyle={mapStyle}
                onMapStyle={this.handleChange("mapStyle")}
              />
              <GeolocateControl
                style={{ position: "absolute", left: ".5em", bottom: ".5em" }}
                // onViewportChange={this.handleChange("viewport")}
                positionOptions={{ enableHighAccuracy: true }}
                // trackUserLocation={true}
                showUserLocation={true}
              />
            </ReactMapGL>
          )}
        </Grid>
      </Grid>
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { mapStyle, user } = nextProps;
    if (mapStyle && user && !prevState.mapStyle) {
      const { markers } = user.preferences;
      mapStyle.layers
        .filter((layer) => layer.id.startsWith("spaces"))
        .forEach(
          (layer) => (layer.layout.visibility = markers ? "visible" : "none")
        );
      return { mapStyle };
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => ({
  auth: selectLoginUser(state),
  mapInfo: selectMapInfo(state),
  mapStyle: selectMapStyle(state),
  user: selectUser(state),
});

const mapActionToProps = { fetchMapInfo, fetchMapStyle };

export default connect(
  mapStateToProps,
  mapActionToProps
)(withStyles(styles)(PrkMap));
