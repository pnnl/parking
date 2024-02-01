import parking from "./parking";
import vehicle from "./vehicle";

describe("constants.parking", () => {
  describe("parking.allowed()", () => {
    it("(PAID, passenger) is true", () => {
      expect(parking.allowed("PAID", "passenger")).toEqual(true);
    });
    it("(Bus, passenger) is false", () => {
      expect(parking.allowed("Bus", "passenger")).toEqual(false);
    });
    it("(Bus, undefined) is false", () => {
      expect(parking.allowed("Bus", "undefined")).toEqual(false);
    });
  });

  describe("parking.PAID.allowed()", () => {
    it("(Passenger) is true", () => {
      expect(parking.PAID.allowed(vehicle.Passenger)).toEqual(true);
    });
    it("(Transport) is false", () => {
      expect(parking.PAID.allowed(vehicle.Transport)).toEqual(false);
    });
    it("(undefined) is false", () => {
      expect(parking.PAID.allowed()).toEqual(false);
    });
  });
});
