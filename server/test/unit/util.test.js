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
const _ = require("lodash");
const { expect } = require("code");
const lab = require("lab").script();
const { calculateAvailable } = require("../../routes/api/util");
const { test, suite } = lab;

suite("routes.api.util.calculateAvailable occupancy no state", () => {
  test("should be correct with no available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 5,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(0);
  });

  test("should be correct with 1 available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 3,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(5);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 2,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(10);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 1,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(10);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 0,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(25);
  });
});

suite("routes.api.util.calculateAvailable prediction no state", () => {
  test("should be correct with no available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 5,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(0);
  });

  test("should be correct with 1 available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 3,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(5);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 2,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(10);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 1,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(10);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 0,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).to.equal(25);
  });
});

suite("routes.api.util.calculateAvailable occupancy with state", () => {
  test("should be correct with no available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 5,
      shapeLength: 25,
      state: [false, false, false, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(0);
  });

  test("should be correct with 1 available occupancy in middle", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [false, false, true, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(5);
  });

  test("should be correct with 1 available occupancy on start", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [true, false, false, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(5);
  });

  test("should be correct with 1 available occupancy on end", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [false, false, false, false, true],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 3,
      shapeLength: 25,
      state: [true, false, true, true, false],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(10);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 2,
      shapeLength: 25,
      state: [false, true, true, true, false],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(15);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 1,
      shapeLength: 25,
      state: [false, true, true, true, true],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(20);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 0,
      shapeLength: 25,
      state: [true, true, true, true, true],
    };
    expect(calculateAvailable(space, "occupancy")).to.equal(25);
  });
});

suite("routes.api.util.calculateAvailable prediction with state", () => {
  test("should be correct with no available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 5,
      shapeLength: 25,
      state: [false, false, false, false, false],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(0);
  });

  test("should be correct with 1 available prediction in middle", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [false, false, true, false, false],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(5);
  });

  test("should be correct with 1 available prediction on start", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [true, false, false, false, false],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(5);
  });

  test("should be correct with 1 available prediction on end", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [false, false, false, false, true],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 3,
      shapeLength: 25,
      state: [true, false, true, true, false],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(10);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 2,
      shapeLength: 25,
      state: [false, true, true, true, false],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(15);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 1,
      shapeLength: 25,
      state: [false, true, true, true, true],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(20);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 0,
      shapeLength: 25,
      state: [true, true, true, true, true],
    };
    expect(calculateAvailable(space, "prediction")).to.equal(25);
  });
});

exports.lab = lab;
