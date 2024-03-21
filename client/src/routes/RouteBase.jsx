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

import { PrkLogin, PrkNotice } from "../components";

import { Analytics } from "../utils/analytics";
import React from "react";
import { connect } from "react-redux";
import { isTrue } from "../utils/utils";
import { selectNotice } from "../controllers/common/action";
import { selectUser } from "../controllers/user/action";

class Root extends React.Component {
  isNotice = isTrue(process.env.REACT_APP_NOTICE);

  isLogin = isTrue(process.env.REACT_APP_LOGIN);

  componentDidMount() {
    const { page } = this.props;
    Analytics.getInstance().pageview(page?.path ?? "/unknown");
  }

  render() {
    const { notice, user, page, renderRoute } = this.props;
    if (this.isNotice && !notice) {
      return <PrkNotice />;
    } else if (this.isLogin && page.user && !user) {
      return <PrkLogin />;
    } else {
      return renderRoute(this.props);
    }
  }
}

const mapStateToProps = (state) => ({
  notice: selectNotice(state),
  user: selectUser(state),
});

const mapActionToProps = {};

export default connect(mapStateToProps, mapActionToProps)(Root);
