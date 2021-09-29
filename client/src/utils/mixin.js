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
import _ from "lodash";

export default {
  handleChange: function(key) {
    return (event, value) => {
      value = _.has(event, ["target", "value"]) ? event.target.value : value;
      const state = key ? { [key]: value } : _.assign({}, value);
      const updated = _.intersection(_.keys(this.state), _.keys(state))
        .map((k) => this.state[k] !== state[k])
        .includes(true);
      if (updated) {
        this.setState(
          state,
          _.isFunction(this.handleUpdate)
            ? this.handleUpdate(key, state)
            : undefined
        );
      }
    };
  },
};
