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
import { createMuiTheme } from "@material-ui/core/styles";
import {
  background,
  error,
  lighter,
  primary,
  secondary,
  text,
} from "constants/palette";

const typography = {
  useNextVariants: true,
};

const overrides = {
  MuiCssBaseline: {
    "@global": {
      body: {
        // backgroundImage: 'url("/images/parking-lg-10.png")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right",
        backgroundAttachment: "fixed",
      },
    },
  },
  MuiStepIcon: {
    root: {
      "&$completed": {
        color: secondary,
      },
      "&$active": {
        color: secondary,
      },
    },
    active: {},
    completed: {},
  },
  MuiList: {
    root: {
      width: "100%",
    },
    padding: {
      paddingTop: "0",
      paddingBottom: "0",
    },
  },
  MuiExpansionPanelSummary: {
    root: {
      padding: "0 16px 0 16px",
    },
  },
  MuiExpansionPanelDetails: {
    root: {
      padding: "0",
    },
  },
};

const palette = {
  type: "light",
  primary: {
    main: primary,
    contrastText: text.light,
  },
  secondary: {
    main: secondary,
    contrastText: text.light,
  },
  error: {
    main: error,
    contrastText: text.light,
  },
  background: {
    paper: lighter,
    default: background,
  },
};

const mixins = {
  toolbar: {
    minHeight: 0,
    "@media (min-width:0px) and (orientation: landscape)": {
      minHeight: 0,
    },
    "@media (min-width:600px)": {
      minHeight: 0,
    },
  },
};

const name = "Yellow Orange Science Blue Spectacled Bear";

const theme = createMuiTheme({ mixins, typography, overrides, palette, name });

export default theme;
