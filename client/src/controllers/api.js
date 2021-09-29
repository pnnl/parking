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

export const SERVICE_URL = "/api";

export const setAuthorization = (token) => {
  localStorage.setItem("authorization", token);
};

export const getAuthorization = () => {
  const token = localStorage.getItem("authorization");
  if (!_.isEmpty(token) && token !== "null") {
    return token;
  }
};

export const createQuery = (params) => {
  return Object.keys(params)
    .map((key) => key + "=" + params[key])
    .join("&");
};

const validateResponse = async (response) => {
  switch (response.status) {
    case 0:
    case 302:
    case 401:
      throw Error("Session is invalid.");
    default:
      if (!response.ok) {
        let message = response.statusText;
        try {
          let result = await response.text();
          result = JSON.parse(result);
          if (_.isString(result) && result.length > 0) {
            message = result;
          } else if (
            _.isObject(result) &&
            _.isString(result.message) &&
            result.message.length > 0
          ) {
            message = result.message;
          }
        } catch {
          // purposefully ducked catch
        }
        throw Error(message);
      }
      return response;
  }
};

const handleResponse = async (response) => {
  let result = null;
  try {
    result = await response.text();
    result = JSON.parse(result);
  } catch {
    // purposely ducked catch
  }
  return result;
};

const handleError = (error) => {
  throw error;
};

const defaultOptions = (authenticated) => {
  const authorization = getAuthorization();
  if (
    authenticated &&
    _.isEmpty(authorization) &&
    process.env.NODE_ENV !== "test"
  ) {
    throw Error("Session is invalid.");
  }
  return {
    // mode: "cors", // no-cors, *cors, same-origin
    // cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "manual", // manual, *follow, error
    // referrerPolicy: "client", // no-referrer, *client
    ...(authenticated && { credentials: "include" }),
    headers: {
      Accept: "application/json",
      ...(authenticated && { Authorization: `Token ${getAuthorization()}` }),
    },
  };
};

const createTarget = (endpoint, params) => {
  let target = `${SERVICE_URL}/${endpoint}`;
  if (params) {
    const query = createQuery(params);
    target = `${target}?${query}`;
  }
  return target;
};

export const read = (endpoint, query = null, authenticated = false) => {
  const options = _.merge({}, defaultOptions(authenticated), {
    method: "GET",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      ...(query === null && { "Cache-Control": "no-store" }),
    },
  });
  let target = createTarget(endpoint, query);
  return fetch(target, options)
    .then(validateResponse)
    .then(handleResponse)
    .catch(handleError);
};

export const update = (endpoint, body, query = null, authenticated = false) => {
  const options = _.merge({}, defaultOptions(authenticated), {
    method: "PUT",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let target = createTarget(endpoint, query);
  return fetch(target, options)
    .then(validateResponse)
    .then(handleResponse)
    .catch(handleError);
};

export const create = (endpoint, body, query = null, authenticated = false) => {
  const options = _.merge({}, defaultOptions(authenticated), {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let target = createTarget(endpoint, query);
  return fetch(target, options)
    .then(validateResponse)
    .then(handleResponse)
    .catch(handleError);
};

export const remove = (endpoint, query = null, authenticated = false) => {
  const options = _.merge({}, defaultOptions(authenticated), {
    method: "DELETE",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  });
  let target = createTarget(endpoint, query);
  return fetch(target, options)
    .then(validateResponse)
    .then(handleResponse)
    .catch(handleError);
};

export const upload = (endpoint, file, query = null, authenticated = false) => {
  const data = new FormData();
  data.append("file", file.files[0]);
  const options = _.merge({}, defaultOptions(authenticated), {
    method: "POST",
    headers: {
      // setting the header here will cause the multipart post upload to fail
      // 'Content-Type': '?',
      Accept: "application/json",
    },
    body: data,
  });
  let target = createTarget(endpoint, query);
  return fetch(target, options)
    .then(validateResponse)
    .then(handleResponse)
    .catch(handleError);
};
