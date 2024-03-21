import { IAllowed, IParking, IVehicle } from "../types";

import Base from "./base";
import { merge } from "lodash";
import vehicle from "./vehicle";

class Parking extends Base<IParking> {
  constructor() {
    super(
      [
        {
          name: "PAID",
          label: "Paid Parking",
          allows: ["passenger", "emergency"],
        },
        {
          name: "CV",
          label: "Commercial Vehicle",
          allows: ["commercial", "emergency"],
        },
        { name: "Bus", label: "Bus", allows: ["transport", "emergency"] },
        { name: "ALLEY", label: "ALLEY", allows: ["delivery", "emergency"] },
        {
          name: "BA",
          label: "BARRIER AREA",
          allows: ["emergency"],
        },
        { name: "BIKE", label: "BIKE ZONE", allows: [] },
        { name: "BUS", label: "BUS ZONE", allows: ["transport", "emergency"] },
        {
          name: "BUSLAY",
          label: "BUS LAYOVER ZONE",
          allows: ["transport", "emergency"],
        },
        {
          name: "CHRTR",
          label: "CHARTER BUS ZONE",
          allows: ["transport", "emergency"],
        },
        { name: "CLR", label: "CLEARANCE", allows: ["emergency"] },
        { name: "CR", label: "CURB RAMP", allows: ["passenger", "commercial", "delivery", "transport", "emergency"] },
        {
          name: "CRBBLB",
          label: "CURB BULB",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "CRPL",
          label: "CARPOOL PARKING - FULL TIME",
          allows: ["passenger", "transport", "emergency"],
        },
        {
          name: "CS",
          label: "CARSHARE/FLEXCAR",
          allows: ["passenger", "transport", "emergency"],
        },
        {
          name: "CV-TAX",
          label: "CVLZ - TAXI",
          allows: ["transport", "emergency"],
        },
        {
          name: "CVLZ",
          label: "COMMERCIAL VEHICLE LOAD ZONE",
          allows: ["commercial", "delivery", "emergency"],
        },
        {
          name: "CVLZ",
          label: "Commercial vehicle loading zone",
          allows: ["commercial", "delivery", "emergency"],
        },
        {
          name: "CVLZ-B",
          label: "CVLZ - BUS ZONE",
          allows: ["transport", "emergency"],
        },
        {
          name: "CVLZ-P",
          label: "CVLZ - PLZ",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "CVLZ-TRUCK",
          label: "CVLZ - TRUCK LOAD ONLY",
          allows: ["commercial", "emergency"],
        },
        {
          name: "CVLZS",
          label: "CVLZ - SIGN ONLY",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "CZ",
          label: "CONSULATE ZONE",
          allows: ["delivery", "transport", "emergency"],
        },
        {
          name: "DISABL",
          label: "DISABLED ZONE",
          allows: ["passenger", "emergency"],
        },
        { name: "DW", label: "DRIVEWAY", allows: ["passenger"] },
        { name: "HYD", label: "HYDRANT", allows: ["emergency"] },
        {
          name: "L/UL",
          label: "LOAD/UNLOAD ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "LEVO",
          label: "LAW ENFORCEMENT VEHICLES ONLY",
          allows: ["emergency"],
        },
        {
          name: "LOAD",
          label: "Passenger loading zone",
          allows: ["passenger", "transport", "emergency"],
        },
        { name: "NP", label: "NO PARKING", allows: ["emergency"] },
        {
          name: "OTHERN",
          label: "OTHER SPACE TYPE - NO PARKING",
          allows: ["emergency"],
        },
        {
          name: "OTHERP",
          label: "OTHER SPACE TYPE - YES PARKING",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PARKLET",
          label: "PARKLET",
          allows: ["passenger", "emergency"],
        },
        {
          name: "PLZ",
          label: "PASSENGER LOAD ZONE",
          allows: ["passenger", "transport", "emergency"],
        },
        {
          name: "PLZ-VEND",
          label: "PASSENGER LOAD ZONE - VENDING ZONE",
          allows: ["passenger", "transport", "emergency"],
        },
        { name: "PS", label: "PAY STATION", allows: ["passenger", "transport", "emergency"] },
        {
          name: "PS-BUS",
          label: "PAY STATION - BUS ZONE",
          allows: ["transport", "emergency"],
        },
        {
          name: "PS-CAR",
          label: "PAY STATION - CARPOOL",
          allows: ["passenger", "transport", "emergency"],
        },
        {
          name: "PS-CVLZ",
          label: "PAY STATION - CVLZ",
          allows: ["commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-DIS",
          label: "PAY STATION - DISABLED",
          allows: ["passenger", "emergency"],
        },
        {
          name: "PS-LAY",
          label: "PAY STATION - BUS LAYOVER",
          allows: ["transport", "emergency"],
        },
        {
          name: "PS-LEV",
          label: "PAY STATION - LEVO",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-LUL",
          label: "PAY STATION - LOAD/UNLOAD ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-MC",
          label: "PAY STATION - MOTORCYCLE",
          allows: ["passenger", "emergency"],
        },
        {
          name: "PS-PLZ",
          label: "PAY STATION - PLZ",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-RPZ",
          label: "PAY STATION - RES PARKING ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-SBO",
          label: "PAY STATION - SHUTTLE BUS ONLY",
          allows: ["transport", "emergency"],
        },
        {
          name: "PS-SCH",
          label: "PAY STATION - SCHOOL",
          allows: ["passenger", "transport", "emergency"],
        },
        {
          name: "PS-TAX",
          label: "PAY STATION - TAXI",
          allows: ["transport", "emergency"],
        },
        {
          name: "PS-TR",
          label: "PAY STATION - TEMP REMOVAL",
          allows: [],
        },
        {
          name: "PS-TRK",
          label: "PAY STATION - TRUCK L/U ZONE",
          allows: ["commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "PS-VEN",
          label: "PAY STATION - VENDOR",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "SBO",
          label: "SHUTTLE BUS ONLY",
          allows: ["transport", "emergency"],
        },
        {
          name: "SFD",
          label: "SEATTLE FIRE DEPT ZONE",
          allows: ["emergency"],
        },
        { name: "TAXI", label: "TAXI ZONE", allows: ["transport", "emergency"] },
        {
          name: "TAZ",
          label: "TOW AWAY ZONE",
          allows: [],
        },
        { name: "TL", label: "TIME LIMIT", allows: ["passenger", "commercial", "delivery", "transport", "emergency"] },
        {
          name: "TL-LAY",
          label: "TIME LIMIT - BUS LAYOVER",
          allows: ["transport", "emergency"],
        },
        {
          name: "TL-LUL",
          label: "TIME LIMIT - LOAD/UNLOAD ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TL-PKP",
          label: "TIME LIMIT - PEAK PM",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TL-PLZ",
          label: "TIME LIMIT - PLZ",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TL-RPZ",
          label: "TIME LIMIT - RES PARKING ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TL-TR",
          label: "TIME LIMIT - TEMP REMOVAL",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TL-TRK",
          label: "TIME LIMIT - TRUCK L/U ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "TRUCK",
          label: "TRUCK LOAD/UNLOAD ZONE",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        {
          name: "UNR",
          label: "UNRESTRICTED",
          allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
        },
        { name: "XW", label: "CROSSWALK", allows: [] as string[] },
        {
          name: "XWAREA",
          label: "NOT A DESIGNATED CROSSWALK",
          allows: [] as string[],
        },
      ].map((r) => ({
        ...r,
        allowed: ((_v) => {
          throw new Error("Parking allowed functon not implemented.");
        }) as IAllowed<IVehicle>,
      })),
      (t, r) => merge(r, { allowed: ((...v) => (t as Parking).allowed(r as IParking, ...v)) as IAllowed<IVehicle> })
    );
  }

  // static references to objects
  PAID = this.parseStrict("PAID");
  CV = this.parseStrict("CV");
  Bus = this.parseStrict("Bus");

  /**
   * Determines if parking is allowed for any of the vehicle(s).
   *
   * @param a
   * @param b
   * @returns true if allowed
   */
  allowed = (a: IParking | number | string, ...b: (IVehicle | number | string)[]): boolean => {
    const parking = this.parseStrict(a);
    const vehicles = b.map((v) => vehicle.parse(v)).filter((v) => v);
    const allowed = vehicles.filter((v) => v?.allows.includes(parking?.name) || parking.allows.includes(v?.name ?? ""));
    return allowed.length > 0;
  };
}

const parking = new Parking();

export default parking;
