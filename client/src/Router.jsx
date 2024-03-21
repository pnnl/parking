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
import React from "react";
import rootSaga from "controllers/saga";
import configureStore from "controllers/store";
import { isEmpty, isEqual, max, omit } from "lodash";
import { Provider } from "react-redux";
import { HashRouter, Route, Switch } from "react-router-dom";
import { PrkTheme } from "./components";
import { routes } from "./routes";

const reduxStore = configureStore(window.REDUX_INITIAL_DATA);
reduxStore.runSaga(rootSaga);

let current = [];

const printRoute = (route) => {
  if (route) {
    if (!isEmpty(route.path)) {
      current.push([`(${route.id})`, `[${route.name}]`, `${route.path}`]);
    }
  }
};

const printRoutes = () => {
  const prev = Array.from(current);
  current = [["id", "name", "path"]];
  routes.forEach((r) => printRoute(r));
  const [m0, m1] = [max(current.map((c) => c[0].length)), max(current.map((c) => c[1].length))];
  current = current.map(
    (c, i) =>
      `${"\xa0".repeat(3 - `${i}`.length)}${c[0]}${"\xa0".repeat(m0 - c[0].length + 1)}${c[1]}${"\xa0".repeat(
        m1 - c[1].length + 1
      )}${c[2]}`
  );
  if (!isEqual(prev, current)) {
    // keep this logging statement as it only prints for development
    console.log({ routes: current });
  }
};

class Router extends React.Component {
  renderRoute = (route) => {
    const Element = route.element;
    return (
      <Route
        key={`route-${route.name}`}
        exact={route.exact}
        path={route.path}
        render={() => <Element page={omit(route, ["element"])} />}
      />
    );
  };

  render() {
    if (process.env.NODE_ENV === "development") {
      printRoutes();
    }
    return (
      <Provider store={reduxStore}>
        <PrkTheme>
          <HashRouter>
            <Switch>{routes.map((route) => this.renderRoute(route))}</Switch>
          </HashRouter>
        </PrkTheme>
      </Provider>
    );
  }
}

export default Router;
