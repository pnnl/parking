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
import { generateTypes, generateActions, generateSelectors } from "../util";

export const key = "organizations";

// fetch organizations
export const FETCH_ORGANIZATIONS = generateTypes(key, "list");
export const [
  fetchOrganizations,
  fetchOrganizationsSuccess,
  fetchOrganizationsError,
  fetchOrganizationsBusy
] = generateActions(FETCH_ORGANIZATIONS);
export const [
  selectOrganizations,
  selectOrganizationsError,
  selectOrganizationsBusy,
  selectOrganizationsRequest
] = generateSelectors(FETCH_ORGANIZATIONS);
// fetch organization
export const FETCH_ORGANIZATION = generateTypes(key, "current");
export const [
  fetchOrganization,
  fetchOrganizationSuccess,
  fetchOrganizationError,
  fetchOrganizationBusy
] = generateActions(FETCH_ORGANIZATION);
export const [
  selectOrganization,
  selectOrganizationError,
  selectOrganizationBusy,
  selectOrganizationRequest
] = generateSelectors(FETCH_ORGANIZATION);
// update organization
export const UPDATE_ORGANIZATION = generateTypes(key, "update");
export const [
  updateOrganization,
  updateOrganizationSuccess,
  updateOrganizationError,
  updateOrganizationBusy
] = generateActions(UPDATE_ORGANIZATION);
export const [
  selectUpdateOrganization,
  selectUpdateOrganizationError,
  selectUpdateOrganizationBusy,
  selectUpdateOrganizationRequest
] = generateSelectors(UPDATE_ORGANIZATION);
// remove organization
export const REMOVE_ORGANIZATION = generateTypes(key, "remove");
export const [
  removeOrganization,
  removeOrganizationSuccess,
  removeOrganizationError,
  removeOrganizationBusy
] = generateActions(REMOVE_ORGANIZATION);
export const [
  selectRemoveOrganization,
  selectRemoveOrganizationError,
  selectRemoveOrganizationBusy,
  selectRemoveOrganizationRequest
] = generateSelectors(REMOVE_ORGANIZATION);
// create organization
export const CREATE_ORGANIZATION = generateTypes(key, "create");
export const [
  createOrganization,
  createOrganizationSuccess,
  createOrganizationError,
  createOrganizationBusy
] = generateActions(CREATE_ORGANIZATION);
export const [
  selectCreateOrganization,
  selectCreateOrganizationError,
  selectCreateOrganizationBusy,
  selectCreateOrganizationRequest
] = generateSelectors(CREATE_ORGANIZATION);
