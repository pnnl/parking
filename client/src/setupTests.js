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
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { timestampGenerator } from "./controllers/util";

// set timestamps on busy and error types to a static time for testing
const date = new Date();
timestampGenerator(() => date);

// put timestamps on console statements
console.logCopy = console.log.bind(console);
console.log = function(message) {
  var timestamp = "[" + new Date().toUTCString() + "] ";
  this.logCopy(timestamp, message);
};

// throw an error when a warning is printed to the console
let error = console.error;
console.error = function(message) {
  error.apply(console, arguments); // keep default behaviour
  // throw message instanceof Error ? message : new Error(message);
  throw new Error("Warning message posted to console.");
};

configure({ adapter: new Adapter() });
