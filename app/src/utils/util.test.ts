import { calculateAvailable } from "./util";

describe("util.calculateAvailable", () => {
  test("should be correct with no available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 5,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(0);
  });

  test("should be correct with 1 available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 3,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(5);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 2,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(10);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 1,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(10);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 0,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(25);
  });
});

describe("util.calculateAvailable prediction no state", () => {
  test("should be correct with no available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 5,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(0);
  });

  test("should be correct with 1 available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 3,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(5);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 2,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(10);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 1,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(10);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 0,
      shapeLength: 25,
      state: undefined,
    };
    expect(calculateAvailable(space, "prediction")).toEqual(25);
  });
});

describe("util.calculateAvailable occupancy with state", () => {
  test("should be correct with no available occupancy", async () => {
    const space = {
      sensors: 5,
      occupancy: 5,
      shapeLength: 25,
      state: [false, false, false, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(0);
  });

  test("should be correct with 1 available occupancy in middle", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [false, false, true, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(5);
  });

  test("should be correct with 1 available occupancy on start", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [true, false, false, false, false],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(5);
  });

  test("should be correct with 1 available occupancy on end", async () => {
    const space = {
      sensors: 5,
      occupancy: 4,
      shapeLength: 25,
      state: [false, false, false, false, true],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 3,
      shapeLength: 25,
      state: [true, false, true, true, false],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(10);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 2,
      shapeLength: 25,
      state: [false, true, true, true, false],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(15);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 1,
      shapeLength: 25,
      state: [false, true, true, true, true],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(20);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      occupancy: 0,
      shapeLength: 25,
      state: [true, true, true, true, true],
    };
    expect(calculateAvailable(space, "occupancy")).toEqual(25);
  });
});

describe("util.calculateAvailable prediction with state", () => {
  test("should be correct with no available prediction", async () => {
    const space = {
      sensors: 5,
      prediction: 5,
      shapeLength: 25,
      state: [false, false, false, false, false],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(0);
  });

  test("should be correct with 1 available prediction in middle", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [false, false, true, false, false],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(5);
  });

  test("should be correct with 1 available prediction on start", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [true, false, false, false, false],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(5);
  });

  test("should be correct with 1 available prediction on end", async () => {
    const space = {
      sensors: 5,
      prediction: 4,
      shapeLength: 25,
      state: [false, false, false, false, true],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(5);
  });

  test("should be correct with 2 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 3,
      shapeLength: 25,
      state: [true, false, true, true, false],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(10);
  });

  test("should be correct with 3 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 2,
      shapeLength: 25,
      state: [false, true, true, true, false],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(15);
  });

  test("should be correct with 4 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 1,
      shapeLength: 25,
      state: [false, true, true, true, true],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(20);
  });

  test("should be correct with 5 available occupancies", async () => {
    const space = {
      sensors: 5,
      prediction: 0,
      shapeLength: 25,
      state: [true, true, true, true, true],
    };
    expect(calculateAvailable(space, "prediction")).toEqual(25);
  });
});
