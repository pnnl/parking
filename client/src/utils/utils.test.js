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
import {
  filter,
  getDocumentHeight,
  getDocumentWidth,
  lowestUnusedNumber,
} from "./utils";

describe("utils.getDocumentWidth()", () => {
  it("width should be 0 when no page is shown", () => {
    expect(getDocumentWidth()).toEqual(0);
  });
});

describe("utils.getDocumentHeight()", () => {
  it("height should be 0 when no page is shown", () => {
    expect(getDocumentHeight()).toEqual(0);
  });
});

describe("utils.lowestUnusedNumber()", () => {
  it("empty sequence should return from value", () => {
    expect(lowestUnusedNumber([], 1)).toEqual(1);
  });
  it("first missing number should returned", () => {
    expect(lowestUnusedNumber([1, 2, 4], 1)).toEqual(3);
  });
  it("full array should return next number in sequence", () => {
    expect(lowestUnusedNumber([1, 2, 3, 4], 1)).toEqual(5);
  });
  it("should return from value for sequence starting above from value", () => {
    expect(lowestUnusedNumber([3], 2)).toEqual(2);
  });
});

describe("utils.filter()", () => {
  let items = null;
  let paths = null;

  beforeEach(() => {
    items = JSON.parse(
      JSON.stringify([
        {
          index: 0,
          name: "zero",
          label: "label",
        },
        {
          index: 1,
          name: "one",
          label: "label",
        },
        {
          index: 2,
          name: "two",
          label: "label",
        },
      ])
    );
    paths = JSON.parse(
      JSON.stringify([
        {
          index: 0,
          name: "zero",
          label: "label",
          items: [
            {
              index: 0,
              name: "zero-a",
              label: "label",
            },
            {
              index: 1,
              name: "zero-b",
              label: "label",
            },
            {
              index: 2,
              name: "zero-c",
              label: "label",
            },
          ],
          data: {
            name: "zero-c",
            label: "label",
          },
        },
        {
          index: 1,
          name: "one",
          label: "label",
          items: [],
          data: {},
        },
        {
          index: 2,
          name: "two",
          label: "label",
          items: null,
          data: null,
        },
      ])
    );
  });

  it("should return all items when no search is specified", () => {
    const expected = items.map((item) => ({
      ...item,
      terms: {
        index: [item.index, "", ""],
        name: [item.name, "", ""],
        label: [item.label, "", ""],
      },
    }));
    expect(filter(items)).toEqual(expected);
  });

  it("should filter terms when keys is specified", () => {
    const expected = items.map((item) => ({
      ...item,
      terms: {
        name: [item.name, "", ""],
        label: [item.label, "", ""],
      },
    }));
    expect(filter(items, null, ["name", "label"])).toEqual(expected);
  });

  it("should filter when search is specified", () => {
    const expected = [
      {
        index: 0,
        name: "zero",
        label: "label",
        terms: {
          index: [0, "", ""],
          name: ["", "z", "ero"],
          label: ["label", "", ""],
        },
      },
    ];
    expect(filter(items, "z")).toEqual(expected);
  });

  it("should filter when search and keys is specified", () => {
    const expected = [
      {
        index: 0,
        name: "zero",
        label: "label",
        terms: {
          name: ["z", "e", "ro"],
        },
      },
      {
        index: 1,
        name: "one",
        label: "label",
        terms: {
          name: ["on", "e", ""],
        },
      },
    ];
    expect(filter(items, "e", ["name"])).toEqual(expected);
  });

  it("should filter when search and path is specified", () => {
    const expected = [
      {
        index: 0,
        name: "zero",
        label: "label",
        terms: {
          name: ["z", "e", "ro"],
        },
      },
      {
        index: 1,
        name: "one",
        label: "label",
        terms: {
          name: ["on", "e", ""],
        },
      },
    ];
    expect(filter(items, "e", ["$.name"])).toEqual(expected);
  });

  it("should filter recursively when search and path is specified", () => {
    const expected = [
      {
        index: 0,
        name: "zero",
        label: "label",
        items: [
          {
            index: 0,
            name: "zero-a",
            label: "label",
          },
          {
            index: 1,
            name: "zero-b",
            label: "label",
          },
          {
            index: 2,
            name: "zero-c",
            label: "label",
            terms: {
              name: ["zero", "-c", ""],
            },
          },
        ],
        data: {
          name: "zero-c",
          label: "label",
          terms: {
            name: ["zero", "-c", ""],
          },
        },
      },
    ];
    expect(filter(paths, "-c", ["$..name"])).toEqual(expected);
  });
});
