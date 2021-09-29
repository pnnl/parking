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
import { available, text, unavailable, unknown } from "constants/palette";

const styles = (theme) => ({
  root: {
    display: "-webkit-box",
    textAlign: "left",
    margin: ".5em",
    position: "absolute",
    left: "0px",
    zIndex: 1000,
    [theme.breakpoints.down("xs")]: {
      top: 50,
    },
  },
  title: {
    marginLeft: ".5em",
    flex: 1,
  },
  card: {
    width: 300,
    maxWidth: 300,
  },
  actions: {},
  icons: {
    padding: 0,
  },
  content: {
    maxHeight: 400,
    overflow: "auto",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  form: {
    width: "100%",
    marginBottom: "20px",
  },
  formEntry: {
    position: "relative",
  },
  infoIcon: {
    position: "absolute",
    margin: "auto",
    textAlign: "center",
    top: "50%",
    bottom: "50%",
  },
  selectAvailability: {
    width: "120px",
    marginLeft: "50px",
  },
  truckIcon: {
    position: "absolute",
    margin: "auto",
    marginLeft: "8px",
    textAlign: "center",
    top: "50%",
    bottom: "50%",
  },
  labelRequirement: {
    display: "inline-block",
    marginLeft: "46px",
    marginRight: "16px",
    marginTop: "7px",
    marginBottom: "7px",
  },
  selectRequirement: {
    width: "120px",
    marginLeft: "50px",
  },
  avatar: {
    display: "inline-flex",
  },
  symbol: {
    display: "inline-flex",
    color: text.light,
    textShadow: `-1px 0 ${text.subtle}, 0 1px ${text.subtle}, 1px 0 ${text.subtle}, 0 -1px ${text.subtle}`,
  },
  label: { marginLeft: "0.5em" },
  labelAvailable: { marginRight: "16px" },
  arrowUpward: {
    transform: "translate(0,10px) scale(1,1.5)",
    color: available,
  },
  unknown: {
    transform: "translate(0,10px) scale(1, 2.5) rotate(90deg)",
    color: unknown,
  },
  arrowDownward: {
    transform: "translate(0,10px) scale(1,1.5)",
    color: unavailable,
  },
});

export default styles;
