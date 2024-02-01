import { IAllowed, IParking, IVehicle } from "../types";

import Base from "./base";
import { merge } from "lodash";
import parking from "./parking";

class Vehicle extends Base<IVehicle> {
  constructor() {
    super(
      [
        {
          name: "passenger",
          label: "Passenger",
          allows: [] as string[],
        },
        {
          name: "commercial",
          label: "Commercial",
          allows: [] as string[],
        },
        {
          name: "delivery",
          label: "Delivery",
          allows: [] as string[],
        },
        {
          name: "transport",
          label: "Transport",
          allows: [] as string[],
        },
        {
          name: "emergency",
          label: "Emergency",
          allows: [] as string[],
        },
      ]
        .map((r) => merge(r, { allowed: ((...v) => this.allowed(r as IVehicle, ...v)) as IAllowed<IParking> }))
        .map((v) => Object.freeze(merge(v, { allows: Object.freeze(v.allows) })))
    );
  }

  // static references to objects
  Passenger = this.parseStrict("passenger");
  Commercial = this.parseStrict("commercial");
  Delivery = this.parseStrict("delivery");
  Transport = this.parseStrict("transport");
  Emergency = this.parseStrict("emergency");

  /**
   * Determines if the vehicle is allowed to park in any of the type(s).
   *
   * @param a
   * @param b
   * @returns true if allowed
   */
  allowed = (a: IVehicle | number | string, ...b: Array<IParking | number | string>): boolean => {
    const vehicle = this.parseStrict(a);
    const parkings = b.map((v) => parking.parse(v)).filter((v) => v);
    const allowed = parkings.filter((p) => p?.allows.includes(vehicle?.name) || vehicle.allows.includes(p?.name ?? ""));
    return allowed.length > 0;
  };
}

const vehicle = new Vehicle();

export default vehicle;
