"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { Button, Icon } from "@blueprintjs/core";
import ReactMapGL, { GeolocateControl, Popup, ScaleControl, ViewState } from "react-map-gl";
import { capitalize, debounce, get, isArray, isEqual, isNumber, isString } from "lodash";

import Control from "./control";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { VehicleType } from "@/common";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { parseBoolean } from "@/utils/util";

export interface MapProps {}

export default class Map extends React.Component<
  MapProps,
  {
    width: number;
    height: number;
    viewport: ViewState;
    preferences: any;
    mapStyle: any;
    intid?: number;
    popupInfo?: any;
  } & Record<string, any>
> {
  map: React.RefObject<any>;
  querySourceDataDebounced() {
    // ignore empty method
  }

  constructor(props: any) {
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
        padding: { bottom: 0, left: 0, right: 0, top: 0 },
      },
      preferences: {},
      mapStyle: props.mapStyle,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.querySourceData = this.querySourceData.bind(this);
    this.querySourceDataDebounced = debounce(this.querySourceData, 500);
  }

  isPredictions = parseBoolean(process.env.NEXT_PUBLIC_PREDICTIONS);

  static getDerivedStateFromProps(props: any, state: any) {
    if (!state.mapStyle && props.mapStyle) {
      return { mapStyle: props.mapStyle };
    }
    return null;
  }

  componentDidMount() {
    fetch("/osm/style.json")
      .then(async (value) => {
        const json = await value.json();
        this.setState({ mapStyle: json });
      })
      .catch((error) => console.log(`Failed to get OSM style: ${error.message}`));
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    const intid = window.setInterval(
      this.querySourceDataDebounced,
      parseInt(process.env.NEXT_PUBLIC_POLLING ?? "5000")
    );
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

  templateFormat = (template: any, props: any) => {
    return template.replace(/{([^{}]+)}/g, (v: any, k: any) => get(props, k, `{${k}}`));
  };

  querySourceData() {
    if (this.map?.current) {
      const { viewport, preferences } = this.state;
      const { longitude, latitude, zoom } = viewport;
      const predict = this.isPredictions && get(preferences, "predictions", false);
      const m = this.map.current.getMap();
      if (m?.getStyle) {
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
          uuid,
        };
        ["occupancies", "spaces", "clustered"].forEach((s) => {
          const source = m.getSource(s);
          if (source) {
            let url = source._options.data;
            url = this.templateFormat(url, params);
            if (s === "occupancies") {
              if (predict) {
                url = url.replace("occupancies", "predictions");
              }
            }
            source.setData(url);
          }
        });
      }
    }
  }

  transformRequest = (url: string, resourceType: string) => {
    switch (resourceType) {
      case "Source":
      case "Style":
      case "Tile":
      case "Glyphs":
        return {
          url: url,
          redirect: "manual",
          headers: {
            "Cache-Control": "no-store",
          },
        };
      default:
        return {
          url: url,
        };
    }
  };

  handleChange = (key: string) => (value: any) => {
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
        this.setState({ [key]: value }, this.querySourceDataDebounced);
        break;
      default:
      // no need to handle all cases
    }
    this.setState({ [key]: value });
  };

  handleLoad = (_event: any) => {
    console.log("Map-GL finished initial loading.");
    this.querySourceDataDebounced();
  };

  handleViewStateChange = () => {
    // hide the popup
    this.setState({ popupInfo: null });
  };

  handleError = (event: any) => {
    console.error(event);
  };

  handleMapStyle = (_event: any) => {
    this.querySourceDataDebounced();
  };

  handleClick = (event: any) => {
    this.handleMouseDown(event);
  };

  handleMouseMove = (event: any) => {
    this.handleMouseDown(event);
  };

  handleMouseDown = (event: any) => {
    const map = this.map?.current?.getMap();
    if (map) {
      const features = map.queryRenderedFeatures([event.center.x, event.center.y], {
        // filtering on layers isn't working for some reason
        // layers: ["spaces", "occupied", "available"]
      });
      if (features.length > 0) {
        const feature = features[0];
        const layer = feature?.layer?.id?.split("-")[0];
        switch (layer) {
          case "spaces":
          case "indeterminate":
          case "available":
          case "unknown":
          case "occupied":
            {
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
            }
            break;
          default:
        }
      } else {
        this.setState({ popupInfo: null });
      }
    }
  };

  renderPopup() {
    const { preferences } = this.state;
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
    } = popupInfo?.properties ?? {};
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
    const extra = { min: min, max: max, unavailable: false };
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
          className={`popup ${popupInfo.layer}`}
          // tipSize={5}
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          closeButton={false}
        >
          <div className="popup-header">
            <div className="popup-spacer" />
            <Button aria-label="close" onClick={() => this.setState({ popupInfo: null })} minimal>
              <Icon icon={IconNames.CROSS} />
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <React.Fragment>
              <p>{`${capitalize(blockId)} - ${blockfaceId} - ${cvlzId}`}</p>
              <br />
              <p>{`${open} out of ${total} open`}</p>
              <br />
              <p>{`current: ${current}`}</p>
              <br />
              <p>{`available: ${available}`}</p>
              <br />
              <p>{`prediction: ${prediction}`}</p>
              <br />
              <p>{`required: ${required}`}</p>
              <br />
              <p>{`shapeLength: ${shapeLength}`}</p>
              <br />
              <p>{`state (occupied): ${state}`}</p>
              <br />
            </React.Fragment>
          )}
          <p>{`${spaceType}: ${spaceTyped}`}</p>
          <p>{`${Math.round(shapeLength)} ft total length`}</p>
          {!occupancies ? (
            <p>No occupancy data available</p>
          ) : precise ? (
            <p>{`${Math.round(current)} ft available now`}</p>
          ) : isEqual(min, max) ? (
            <p>{`${Math.round(min)} ft available now`}</p>
          ) : (
            <p>{`${Math.round(min)} to ${Math.round(max)} ft available now`}</p>
          )}
          {predict ? (
            !predictions || extra.unavailable ? (
              <p>No prediction data available</p>
            ) : precise ? (
              <p>{`${Math.round(available)} ft available within ${availability} minutes`}</p>
            ) : isEqual(extra.min, extra.max) ? (
              <p>{`${Math.round(extra.min)} ft available within ${availability} minutes`}</p>
            ) : (
              <p>{`${Math.round(extra.min)} to ${Math.round(
                extra.max
              )} ft available within ${availability} minutes`}</p>
            )
          ) : null}
        </Popup>
      )
    );
  }

  render() {
    const { preferences, mapStyle, viewport, width, height } = this.state;
    console.log({ preferences, mapStyle, viewport, width, height });
    return (
      <ReactMapGL
        mapLib={mapboxgl}
        ref={this.map}
        viewState={{ width, height, ...viewport }}
        style={{ width, height }}
        mapStyle={mapStyle}
        // onViewportChange={this.handleChange("viewport")}
        // onViewStateChange={this.handleViewStateChange}
        onLoad={this.handleLoad}
        onError={this.handleError}
        // onMapStyle={this.handleMapStyle}
        // onMouseMove={this.handleMouseMove}
        onMouseDown={this.handleMouseDown}
        onClick={this.handleClick}
        transformRequest={this.transformRequest}
        // transitionDuration={1000}
        // transitionInterpolator={new FlyToInterpolator()}
        // disableTokenWarning={true}
        // mapOptions={{
        //   userProperties: true,
        //   customAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // }}
      >
        {this.renderPopup()}
        <Control
          preferences={preferences}
          setPreferences={this.handleChange("preferences")}
          mapStyle={mapStyle}
          setMapStyle={this.handleChange("mapStyle")}
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
    );
  }
}
