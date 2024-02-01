import { IBase, ISpace, IType } from "./types";
import { camelCase, isArray } from "lodash";

import { singular } from "pluralize";

/**
 * Calculate the maximum available space.
 *
 * @param {*} space
 * @param {String} type of occupancy or prediction
 * @returns available space
 */
export const calculateAvailable = <T extends IType>(space: IBase & ISpace<T>, type: T) => {
  const open = space.sensors - space[type];
  const segment = space.shapeLength / Math.max(1, space.sensors);
  let available = open < space.sensors ? segment * Math.ceil(open / 2) : segment * open;
  if (isArray(space.state)) {
    // search for longest contiguous space
    let max = 0;
    let temp = 0;
    for (const unnoccupied of space.state) {
      temp += unnoccupied ? segment : 0;
      max = Math.max(max, temp);
      if (!unnoccupied) {
        temp = 0;
      }
    }
    available = max;
  }
  return Math.round(available);
};

export const getFirstValue = (value: string[] | string | undefined) => (isArray(value) ? value[0] ?? "" : value);

/**
 * Parse a string and return a boolean value.
 */
export const parseBoolean = (value?: string) => (value ? /^\s*true|yes|t|y\s*$/i.test(value) : false);

/**
 * Parse the template and replace all {enclosed} entries with the corresponding property.
 */
export const templateFormat = (template: string, props: any) => {
  return template.replace(/{([^{}]+)}/g, (v, k) => props[k]);
};

/**
 * Convert a list of objects into a list of ids. Will rename the attribute to `attributeIds`.
 */
export const objectsToIds = (object: any, attributes: Array<string> | string, remove = true) => {
  attributes = isArray(attributes) ? attributes : [attributes];
  attributes.forEach((a) => {
    const ids = camelCase(`${singular(a)} Ids`);
    const objects = (isArray(object[a]) ? object[a] : [object[a]]).filter((v: any) => v);
    object[ids] = objects.map((v: any) => v.id);
    if (remove) {
      delete object[a];
    }
  });
  return object;
};

/**
 * Executes the list of tasks in series.
 * The result will be an array of the results.
 */
export const promiseChain = (tasks: Array<(r: any) => Promise<any>>) => {
  return tasks.reduce((chain: Promise<any>, task) => {
    return chain.then((results) => task(results).then((result) => [...results, result]));
  }, Promise.resolve([]));
};

/**
 * Executes the list of tasks in series.
 * The result will be the first promise to resolve.
 */
export const promiseFirst = <T>(tasks: Array<() => Promise<T>>) => {
  return new Promise<T>(async (resolve, reject) => {
    let fault;
    for (const task of tasks) {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        fault = error;
      }
    }
    reject(fault);
  });
};

export const delay = (d: number) => new Promise((r) => setTimeout(r, d));
