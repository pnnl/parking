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
import { validate } from "./form";

describe("form.validate()", () => {
  it("should allow for a valid type", () => {
    expect(validate("email")).toBeTruthy();
  });

  it("should throw exception for an invalid type", () => {
    expect(() => validate("nonsense")).toThrow();
  });
});

describe("form.validate().isValid()", () => {
  it("should validate email", () => {
    expect(validate("email").isValid("john.doe@pnnl.gov")).toBeTruthy();
  });

  it("should invalidate email", () => {
    expect(validate("email").isValid("john.doe@invalid")).toBeFalsy();
  });

  it("should validate name", () => {
    expect(validate("name").isValid("john doe")).toBeTruthy();
  });

  it("should invalidate name", () => {
    expect(validate("name").isValid("j")).toBeFalsy();
  });

  it("should validate password", () => {
    expect(validate("password").isValid("P@ssW0rd")).toBeTruthy();
  });

  it("should invalidate password", () => {
    expect(validate("password").isValid("password")).toBeFalsy();
  });

  it("should validate url", () => {
    expect(validate("url").isValid("http://foo.com")).toBeTruthy();
  });

  it("should invalidate url", () => {
    expect(validate("url").isValid("foo")).toBeFalsy();
  });
});

describe("form.validate().getMessage()", () => {
  it("should validate email", () => {
    expect(validate("email").getMessage("john.doe@pnnl.gov")).toBeFalsy();
  });

  it("should invalidate email", () => {
    expect(validate("email").getMessage("john.doe@invalid")).toBeTruthy();
  });

  it("should validate name", () => {
    expect(validate("name").getMessage("john doe")).toBeFalsy();
  });

  it("should invalidate name", () => {
    expect(validate("name").getMessage("j")).toBeTruthy();
  });

  it("should validate password", () => {
    expect(validate("password").getMessage("P@ssW0rd")).toBeFalsy();
  });

  it("should invalidate password", () => {
    expect(validate("password").getMessage("password")).toBeTruthy();
  });

  it("should validate url", () => {
    expect(validate("url").getMessage("http://foo.com")).toBeFalsy();
  });

  it("should invalidate url", () => {
    expect(validate("url").getMessage("foo")).toBeTruthy();
  });
});
