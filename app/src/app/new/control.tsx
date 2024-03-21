import { Button, Card, Collapse, FormGroup, Icon, MenuItem, Switch, Tooltip } from "@blueprintjs/core";
import { cloneDeep, isEqual, range } from "lodash";

import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Select } from "@blueprintjs/select";
import { VehicleType } from "@/common";
import moment from "moment";
import { parseBoolean } from "@/utils/util";

export interface ControlProps {
  preferences: any;
  setPreferences: (preferences: any) => void;
  mapStyle: any;
  setMapStyle: (mapStyle: any) => void;
  onChange: () => void;
}

export default class Control extends React.Component<ControlProps, { expanded: boolean } & Record<string, any>> {
  constructor(props: ControlProps) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  isMarkers = parseBoolean(process.env.NEXT_PUBLIC_MARKERS);
  isPredictions = parseBoolean(process.env.NEXT_PUBLIC_PREDICTIONS);
  isDeferred = parseBoolean(process.env.NEXT_PUBLIC_DEFERRED);
  isVehicleType = parseBoolean(process.env.NEXT_PUBLIC_VEHICLE_TYPE);
  isVehicleLength = parseBoolean(process.env.NEXT_PUBLIC_VEHICLE_LENGTH);

  componentDidMount() {
    this.updateLayoutProperties();
  }

  getLayoutProperty = (id: string, property: string) => {
    const { mapStyle } = this.props;
    if (mapStyle) {
      const { layers } = mapStyle;
      const layer = layers.find((layer: any) => layer.id === id);
      return layer?.layout[property];
    }
  };

  setLayoutProperty = (id: string[] | string, property: string, value: any) => {
    const { mapStyle, setMapStyle } = this.props;
    if (mapStyle) {
      const updated = cloneDeep(mapStyle);
      const { layers } = updated;
      const ids = Array.isArray(id) ? id : [id];
      layers.filter((layer: any) => ids.includes(layer.id)).forEach((layer: any) => (layer.layout[property] = value));
      setMapStyle(updated);
    }
  };

  updateLayoutProperties = () => {
    const { mapStyle, setMapStyle, preferences } = this.props;
    if (mapStyle) {
      const updated = cloneDeep(mapStyle);
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
        layers.filter((layer: any) => ids.includes(layer.id)).forEach((layer: any) => (layer.layout[property] = value));
      });
      setMapStyle(updated);
    }
  };

  updateUserPreferences = (key: string, value: any) => {
    const { preferences, setPreferences, onChange } = this.props;
    const prev = cloneDeep(preferences);
    const temp = cloneDeep(preferences);
    temp[key] = value;
    if (!isEqual(prev, temp)) {
      setPreferences(temp);
      onChange();
    }
  };

  handleChange = (key: string) => (event: any, value: any) => {
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
        // this.setState({ [key]: event.target.value });
        this.updateUserPreferences(key, event.target.value ?? value);
        break;
      default:
        this.setState({ [key]: value });
    }
  };

  renderExtraSpaces() {
    const { preferences } = this.props;
    return (
      this.isMarkers && (
        <div className="form">
          <FormGroup label="Display Extra Spaces" labelFor="markers" aria-label="position">
            <Tooltip
              content={`Display extra spaces that do not have real time occupancy ${
                this.isPredictions ? "or prediction " : ""
              }information.`}
            >
              <Switch
                checked={preferences.markers}
                onClick={(event) => this.handleChange("markers")(event, !preferences.markers)}
              />
            </Tooltip>
          </FormGroup>
        </div>
      )
    );
  }

  availabilityItems = [
    { value: 0, label: "No prediction" },
    { value: 5, label: "5 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
  ];

  renderAvailability() {
    const { preferences } = this.props;
    const availability = preferences.availability !== undefined ? preferences.availability : 0;
    return (
      this.isPredictions && (
        <div className="form">
          <FormGroup label="Predicted Availability" labelFor="availability" aria-label="position">
            <Tooltip content="Length of time in the future to display predicted availability of spaces.">
              <Select
                items={this.availabilityItems}
                itemRenderer={(value, { modifiers, handleClick, handleFocus }) => (
                  <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={value.value}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    text={value.label}
                  />
                )}
                onItemSelect={(value, event) => this.handleChange("availability")(event, value.value)}
              >
                <Button
                  text={this.availabilityItems.filter((v) => v.value === availability).pop()?.label}
                  rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
                />
              </Select>
            </Tooltip>
          </FormGroup>
        </div>
      )
    );
  }

  renderDeferred() {
    const { preferences } = this.props;
    const m = moment().startOf("minutes").get("minutes");
    const t = moment()
      .startOf("minutes")
      .set("minutes", Math.floor(m / 15) * 15);
    // const k = t.get("hours") * 60 + t.get("minutes");
    const deferred = preferences.deferred !== undefined ? preferences.deferred : 0;
    return (
      this.isDeferred && (
        <div className="form">
          <FormGroup label="Future Allocation" labelFor="deferred" aria-label="position">
            <Tooltip content="Specific time of the day to determine availability according to allocated parking space type.">
              <Select
                items={range(0, 10).map((v) => ({
                  value: v, // value: k + v * 15,
                  label: t
                    .clone()
                    .add(v * 15, "minutes")
                    .format("hh:mm a"),
                }))}
                itemRenderer={(value, { modifiers, handleClick, handleFocus }) => (
                  <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={value.value}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    text={value.label}
                  />
                )}
                onItemSelect={(value, event) => this.handleChange("availability")(event, value.value)}
              >
                <Button
                  text={t
                    .clone()
                    .add(deferred * 15, "minutes")
                    .format("hh:mm a")}
                  rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
                />
              </Select>
            </Tooltip>
          </FormGroup>
        </div>
      )
    );
  }

  vehicleItems = [
    { value: "All", label: "All" },
    { value: VehicleType.Passenger.label, label: "Paid" },
    { value: VehicleType.Commercial.label, label: "Commercial" },
    { value: VehicleType.Transport.label, label: "Bus" },
  ];

  renderVehicleType() {
    const { preferences } = this.props;
    const vehicle = preferences.vehicle !== undefined ? preferences.vehicle : VehicleType.Passenger.label;
    return (
      this.isVehicleType && (
        <div className="form">
          <FormGroup label="Vehicle Type" labelFor="vehicle" aria-label="position">
            <Tooltip content="Vehicle type used to determine applicable spots for parking.">
              <Select
                items={this.vehicleItems}
                itemRenderer={(value, { modifiers, handleClick, handleFocus }) => (
                  <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={value.value}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    text={value.label}
                  />
                )}
                onItemSelect={(value, event) => this.handleChange("vehicle")(event, value.value)}
              >
                <Button
                  text={this.vehicleItems.filter((v) => v.value === vehicle).pop()?.label}
                  rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
                />
              </Select>
            </Tooltip>
          </FormGroup>
        </div>
      )
    );
  }

  requirementItems = [
    { value: 20, label: "20 feet" },
    { value: 25, label: "25 feet" },
    { value: 30, label: "30 feet" },
    { value: 40, label: "40 feet" },
    { value: 50, label: "50 feet" },
    { value: 60, label: "60 feet" },
  ];

  renderVehicleLength() {
    const { preferences } = this.props;
    const requirement = preferences.requirement !== undefined ? preferences.requirement : 20;
    return (
      this.isVehicleLength && (
        <div className="form">
          <FormGroup label="Vehicle Length" labelFor="requirement" aria-label="position">
            <Tooltip content="Vehicle length or minimum length of available space required for parking.">
              <Select
                items={this.requirementItems}
                itemRenderer={(value, { modifiers, handleClick, handleFocus }) => (
                  <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={value.value}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    text={value.label}
                  />
                )}
                onItemSelect={(value, event) => this.handleChange("requirement")(event, value.value)}
              >
                <Button
                  text={this.requirementItems.filter((v) => v.value === requirement).pop()?.label}
                  rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
                />
              </Select>
            </Tooltip>
          </FormGroup>
        </div>
      )
    );
  }

  renderLegend() {
    const { preferences } = this.props;
    return (
      <>
        <div className="form-entry">
          <Icon className="avatar arrow-upward" icon={IconNames.ARROW_UP} />
          <p className="avatar label label-available">
            {!preferences.predictions ? "Parking Available" : "Open parking highly likely"}
          </p>
          <Tooltip
            content={
              !preferences.predictions ? (
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
            <Icon className="info-icon" icon={IconNames.INFO_SIGN} />
          </Tooltip>
        </div>
        <div className="form-entry">
          <Icon className="unknown" icon={IconNames.MINUS} />
          <p className="avatar label"></p>
        </div>
        <div className="form-entry">
          <Icon className="avatar arrow-downward" icon={IconNames.ARROW_DOWN} />
          <p className="avatar label">{!preferences.predictions ? "Parking Unavailable" : "Open parking unlikely"}</p>
        </div>
      </>
    );
  }

  render() {
    const { expanded } = this.state;
    return (
      <div className="control">
        <Card className="card">
          <div className="actions">
            <p className="title">Dynacurb Parking App</p>
            <Button
              minimal
              className={"icons"}
              icon={!expanded ? IconNames.CARET_UP : IconNames.CARET_DOWN}
              onClick={(event) => this.handleChange("expanded")(event, !expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            />
          </div>
          <Collapse isOpen={!expanded}>
            <div className="content">
              {this.renderExtraSpaces()}
              {this.renderAvailability()}
              {this.renderDeferred()}
              {this.renderVehicleType()}
              {this.renderVehicleLength()}
              {this.renderLegend()}
            </div>
          </Collapse>
        </Card>
      </div>
    );
  }
}
