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
import { color } from "d3";

// grays
export const background = "#ffffff";
export const lighter = "#ffffff";
export const darker = "#e8e8e8";
export const darkest = "#9b9b9b";
// colors
export const primary = "#C6B773";
export const primaryTint = color(primary).brighter(1.0).formatHex();
export const primaryShade = color(primary).darker(1.0).formatHex();
export const secondary = "#4ea1d3";
export const secondaryTint = color(secondary).brighter(1.0).formatHex();
export const secondaryShade = color(secondary).darker(1.0).formatHex();
export const accent = "#f4a4a4";
export const accentTint = color(accent).brighter(1.0).formatHex();
export const accentShade = color(accent).darker(1.0).formatHex();
export const error = "#d96a64";
export const errorTint = color(error).brighter(1.0).formatHex();
export const errorShade = color(error).darker(1.0).formatHex();
export const warning = "#d98164";
export const warningTint = color(warning).brighter(1.0).formatHex();
export const warningShade = color(warning).darker(1.0).formatHex();
export const info = "#d9bc64";
export const infoTint = color(info).brighter(1.0).formatHex();
export const infoShade = color(info).darker(1.0).formatHex();
// conditions
export const verified = "#01c353"; // green
export const verifiedTint = "#66db97"; // light green
export const selected = "#1c96f8"; // blue
export const selectedTint = "#d2e6fb"; // light blue
export const active = "#9013fe"; // bright purple
export const disabled = "#d8d8d8";
export const invalid = "#d65000"; // dark orange
// availability
export const available = "#43ba6a";
export const unknown = "#C6B773";
export const unavailable = "#c44a40";
// text
export const text = {
  light: "#ffffff",
  dark: "#393a41",
  subtle: "#88888d",
};
// chart
export const chart = {
  gray: "#36454f",
  red: "#d96464",
  green: "#64d964",
  blue: "#6464d9",
  sequence: [
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
  ],
};
// utils
export const hexToRgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};
