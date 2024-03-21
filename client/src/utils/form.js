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
import validator from "validator";

const isValid = (type, value, values) => {
  switch (type) {
    case "email":
      return (
        validator.isEmail(`${value}`) &&
        (Array.isArray(values) ? !values.includes(value) : true)
      );
    case "username":
      return (
        validator.isLength(`${value}`, { min: 2 }) &&
        (Array.isArray(values) ? !values.includes(value) : true)
      );
    case "name":
      return (
        validator.isLength(`${value}`, { min: 2 }) &&
        (Array.isArray(values) ? !values.includes(value) : true)
      );
    case "password":
      return (
        validator.isLength(`${value}`, { min: 8 }) &&
        validator.matches(
          `${value}`,
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s]).*$/
        )
      );
    case "tagname":
      return (
        validator.isLength(`${value}`, { min: 2 }) &&
        (Array.isArray(values) ? !values.includes(value) : true)
      );
    case "url":
      return validator.isURL(`${value}`);
    default:
      return true;
  }
};

const getMessage = (type, value, values) => {
  if (isValid(type, value, values)) {
    return undefined;
  }
  switch (type) {
    case "email":
      if (!validator.isEmail(`${value}`)) {
        return "Must be a valid email address.";
      } else if (Array.isArray(values) ? values.includes(value) : true) {
        return "An account with this email address already exists.";
      } else {
        return "Must be a valid email address.";
      }
    case "username":
      if (!validator.isLength(`${value}`, { min: 2 })) {
        return "Must be at least 2 characters long.";
      } else if (Array.isArray(values) && values.includes(value)) {
        return "An account with this username already exists.";
      } else {
        return "Must be a valid username.";
      }
    case "name":
      if (!validator.isLength(`${value}`, { min: 2 })) {
        return "Must be at least 2 characters long.";
      } else if (Array.isArray(values) && values.includes(value)) {
        return "An account with this name already exists.";
      } else {
        return "Must be a valid name.";
      }
    case "password":
      if (!validator.isLength(`${value}`, { min: 8 })) {
        return "Must be at least 8 characters long.";
      } else if (!validator.matches(`${value}`, /[a-z]/)) {
        return "Must contain a lowercase letter.";
      } else if (!validator.matches(`${value}`, /[A-Z]/)) {
        return "Must contain an uppercase letter.";
      } else if (!validator.matches(`${value}`, /[0-9]/)) {
        return "Must contain a number.";
      } else if (!validator.matches(`${value}`, /[^a-zA-Z0-9\s]/)) {
        return "Must contain a special character.";
      } else {
        return "Must be a valid password.";
      }
    case "tagname":
      if (!validator.isLength(`${value}`, { min: 2 })) {
        return "Must be at least 2 characters long.";
      } else if (Array.isArray(values) && values.includes(value)) {
        return "A tag with this name already exists with the selected groups.";
      } else {
        return "Must be a valid tag name.";
      }
    case "url":
      return "Must be a valid URL.";
    default:
      return "";
  }
};

export const validate = (type) => {
  switch (type) {
    case "email":
    case "username":
    case "name":
    case "password":
    case "tagname":
    case "url":
      break;
    default:
      throw new Error(
        `Unknown validate option passed to form.validate(): ${type}`
      );
  }
  return {
    isValid: (value, values) => isValid(type, value, values),
    getMessage: (value, values) => getMessage(type, value, values),
  };
};
