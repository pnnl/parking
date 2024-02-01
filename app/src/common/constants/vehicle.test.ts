import parking from "./parking";
import vehicle from "./vehicle";

describe("constants.vehicle", () => {
  describe("vehicle.allowed()", () => {
    it("(passenger, PAID) is true", () => {
      expect(vehicle.allowed("passenger", "PAID")).toEqual(true);
    });
    it("(passenger, Bus) is false", () => {
      expect(vehicle.allowed("passenger", "Bus")).toEqual(false);
    });
    it("(passenger, undefined) is false", () => {
      expect(vehicle.allowed("passenger", "undefined")).toEqual(false);
    });
  });

  describe("vehicle.Passenger.allowed()", () => {
    it("(PAID) is true", () => {
      expect(vehicle.Passenger.allowed(parking.PAID)).toEqual(true);
    });
    it("(Bus) is false", () => {
      expect(vehicle.Passenger.allowed(parking.Bus)).toEqual(false);
    });
    it("(undefined) is false", () => {
      expect(vehicle.Passenger.allowed()).toEqual(false);
    });
  });
});
