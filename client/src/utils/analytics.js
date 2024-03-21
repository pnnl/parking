import ReactGA from "react-ga4";
import { isEmpty } from "lodash";

export class Analytics {
  static instance;

  /**
   * Singleton getter method.
   *
   * @returns the single instance
   */
  static getInstance() {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  _initialized;

  constructor() {
    this._initialized = false;
    this.initialize();
  }

  initialize = () => {
    if (!this._initialized && !isEmpty(process.env.REACT_APP_GA_CLIENT_ID)) {
      ReactGA.initialize(process.env.REACT_APP_GA_CLIENT_ID);
      this._initialized = true;
    }
  };

  /**
   * Called for a page view.
   *
   * @param path
   * @param query
   */
  pageview = (path, query = "") => {
    if (this._initialized) {
      ReactGA.send({ hitType: "pageview", page: `${path}${query}`, title: "Page View" });
    } else {
      console.log(`Analytics Debug Page View: ${path}${query}`);
    }
  };

  /**
   * Called for explicit user actions.
   *
   * @param category
   * @param action
   * @param label
   */
  event = (category, action, label = "") => {
    if (this._initialized) {
      ReactGA.event({ category, action, label });
    } else {
      console.log(`Analytics Debug Event: ${category} -> ${action}${label ? " (" + label + ")" : ""}`);
    }
  };
}
