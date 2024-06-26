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
import { isTrue } from "../../utils/utils";
import { create, read, update, remove } from "../api";

export const SERVICE_ENDPOINT = "organizations";

const authenticate = isTrue(process.env.REACT_APP_AUTHENTICATE);

export const readOrganizations = () => {
  return read(`${SERVICE_ENDPOINT}`, null, authenticate);
};

export const readOrganization = (id) => {
  return read(`${SERVICE_ENDPOINT}/${id}`, null, authenticate);
};

export const removeOrganization = (id) => {
  return remove(`${SERVICE_ENDPOINT}/${id}`, null, authenticate);
};

export const updateOrganization = (id, name) => {
  return update(
    `${SERVICE_ENDPOINT}/${id}`,
    {
      name: name,
    },
    null,
    authenticate
  );
};

export const createOrganization = (name) => {
  return create(
    `${SERVICE_ENDPOINT}`,
    {
      name: name,
    },
    null,
    authenticate
  );
};
