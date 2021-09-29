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
import { selectedTint } from "constants/palette";
import jsonpath from "jsonpath";
import _ from "lodash";
import React from "react";

export function getDocumentWidth() {
  // We always want the client width
  return Math.max(
    // document.body.scrollWidth,
    // document.documentElement.scrollWidth,
    // document.body.offsetWidth,
    // document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

export function getDocumentHeight() {
  // We always want the client height
  return Math.max(
    // document.body.scrollHeight,
    // document.documentElement.scrollHeight,
    // document.body.offsetHeight,
    // document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

/**
 * Tests whether a string value is true or false.
 *  true = true, yes, t, or y
 *  false = anything else
 * @param {String} value
 */
export const isTrue = (value) => {
  return /^[/s]*true|yes|t|y[/s]*$/i.test(value);
};

/**
 * Log the error stack to console if running in development environment.
 * @param {Error} error
 */
export const logError = (error) => {
  if (error && process.env.NODE_ENV === "development") {
    console.log(`[${error.message}]: ${error.stack}`);
  }
};

/**
 * Find the lowest unused number given a sequence of numbers.
 *
 * @param {number[]} sequence the sequence of numbers
 * @param {Integer} from the lowest number to look for
 */
export function lowestUnusedNumber(sequence, from) {
  const arr = sequence.slice(0);
  arr.sort((a, b) => a - b);

  return arr.reduce((lowest, num, i) => {
    const seqIndex = i + from;
    return num !== seqIndex && seqIndex < lowest ? seqIndex : lowest;
  }, arr.length + from);
}

/**
 * Returns an appropriate aria-label given the element's props.
 * @param {*} props
 * @throws {Error} if no aria-label could be derived
 */
export const getAriaLabel = (props) => {
  const { "aria-label": ariaLabel, header, placeholder, children } = props;
  if (ariaLabel) {
    return ariaLabel;
  } else if (!_.isEmpty(header)) {
    return header;
  } else if (!_.isEmpty(placeholder)) {
    return placeholder;
  } else if (_.isString(children)) {
    return children;
  } else {
    throw new Error(
      "Must explicitely specify aria-label if header, placeholder, or tooltip is not defined and children is not plain text."
    );
  }
};

/**
 * Wraps the child component(s) only if the condition is met.
 * Requires three props: condition, wrapper, and children.
 * The condition is a boolean which determines if the wrapper should be utilized.
 * The wrapper is a callback function which passes the children elements.
 * The children are standard React children elements.
 * @param {*} props
 */
export const ConditionalWrapper = ({ condition, wrapper, children }) => {
  return condition ? wrapper(children) : children;
};

/**
 * Create a text span for displaying a search term.
 * Looks through the list of fields until it finds the first one with a search term.
 * @param {*} item the item which may contain terms
 * @param {String} fields the field(s) to return
 */
export const createTerm = (item, ...fields) => {
  const terms = fields
    .map((field) => _.get(item, ["terms", field]))
    .find((v) => v);
  if (terms) {
    return (
      <span>
        {terms[0]}
        <span style={{ backgroundColor: selectedTint }}>
          <strong>{terms[1]}</strong>
        </span>
        {terms[2]}
      </span>
    );
  } else {
    return <span>{item[fields[0]]}</span>;
  }
};

/**
 * Alternative to createTerm for highlighting and bolding multiple instances
 * @param {Array<String>} terms
 */
export const generateTerm = (terms) => {
  if (terms.length === 1 && !terms[0].text) {
    return <span key={`key-${terms[0]}`}>{terms[0]}</span>;
  }

  const generatedTerms = terms.map((term, index) => {
    if (!term || !term.text) {
      return null;
    }
    if (term.fontWeight === "bold") {
      return (
        <span key={`key-${index}`} style={{ backgroundColor: selectedTint }}>
          <strong>{term.text}</strong>
        </span>
      );
    } else if ((term.fontWeight === "normal" && term.text) || term.length) {
      return <span key={`key-${index}`}>{term.text}</span>;
    } else {
      return null;
    }
  });

  return _.compact(generatedTerms);
};

/**
 * Get the index of all instances in a string
 * @param {String} str
 * @param {String} term
 */
const getIndices = (str, term) => {
  const indices = [];
  let startIndex = 0;
  let index;
  while ((index = str.indexOf(term, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + term.length;
  }

  return indices;
};

/**
 * Chunk string into an array of terms to be styled
 * @param {String} item
 * @param {String} field
 */
export const chunkTerms = (item, field) => {
  const terms = [];
  const termsBold = [];
  const termsNormal = [];

  if (!field || field.length === 0) {
    return [item];
  }

  let stringCopy = item.toLowerCase();
  const termCopy = field.toLowerCase();

  const indices = getIndices(stringCopy, termCopy);

  indices.forEach((index) => {
    const slice = item.slice(index, index + termCopy.length);
    termsBold.push(slice);
  });

  let line = "";

  for (let i = 0; i < item.length; i++) {
    if (!indices.includes(i)) {
      line += item[i];
    } else {
      if (line) {
        termsNormal.push(line);
        line = "";
      }

      i += termCopy.length - 1;
    }

    if (i === item.length - 1) {
      termsNormal.push(line);
    }
  }

  for (let i = 0; i < termsNormal.length + termsBold.length; i++) {
    const term = {};

    if (indices.includes(0)) {
      if (!(i % 2)) {
        term.text = termsBold[i / 2];
        term.fontWeight = "bold";
      } else {
        term.text = termsNormal[(i - 1) / 2];
        term.fontWeight = "normal";
      }
    } else {
      if (!(i % 2)) {
        term.text = termsNormal[i / 2];
        term.fontWeight = "normal";
      } else {
        term.text = termsBold[(i - 1) / 2];
        term.fontWeight = "bold";
      }
    }

    terms.push(term);
  }

  return terms;
};

const getTerm = (item, key, term) => {
  const value = item[key];
  const index = _.isString(value) ? value.toLowerCase().indexOf(term) : -1;
  const temp =
    index === -1 || term.length === 0
      ? [value, "", ""]
      : [
          value.slice(0, index),
          value.slice(index, index + term.length),
          value.slice(index + term.length),
        ];
  return { [key]: temp };
};

const addTerm = (item, key, term) => {
  _.assign(item, { terms: getTerm(item, key, term) });
};

/**
 * Searches all of the text fields in the list of items which contain the search value.
 * Returns the complete array if search is not specified.
 * The terms are placed into a terms field which contains an array with three values: prefix, matching term, and suffix.
 * The keys array can contain either a list of fields or jsonpaths (https://www.npmjs.com/package/jsonpath).
 * Fields and jsonpaths can not be mixed. Jsonpaths must start with $.
 * @param {Array} items the list of items to filter
 * @param {String} search the search term
 * @param {Array[String]} keys an optional list of field keys to search in
 */
export const filter = (items, search, keys) => {
  const regex = new RegExp(
    `${search}`.replace(/\*+/i, ".*").replace(/^"/, "^").replace(/"$/, "$"),
    "i"
  );
  const term =
    search && search.length > 0
      ? search.toLowerCase().replace(/^"|"$/i, "")
      : "";
  const jsonpaths =
    Array.isArray(keys) && keys.filter((key) => key.startsWith("$"));
  if (jsonpaths && jsonpaths.length > 0) {
    return items
      .filter((item) => {
        return term
          ? jsonpaths.find((jp) => {
              const tmp = jsonpath
                .query(item, jp)
                .find((v) => (_.isString(v) ? regex.test(v) : false));
              return tmp && tmp.length > 0;
            })
          : true;
      })
      .map((item) => {
        const copy = _.cloneDeep(item);
        jsonpaths.forEach((jp) =>
          jsonpath.nodes(copy, jp).forEach((node) => {
            if (_.isString(node.value) && regex.test(node.value)) {
              const tmp =
                node.path.length <= 2
                  ? copy
                  : _.get(copy, node.path.splice(1, node.path.length - 2));
              addTerm(tmp, node.path[node.path.length - 1], term);
            }
          })
        );
        return copy;
      });
  } else {
    return items
      .filter((item) =>
        term
          ? (keys ? keys : Object.keys(item)).find((key) =>
              _.isString(item[key]) ? regex.test(item[key]) : false
            )
          : true
      )
      .map((item) => {
        const terms = (keys ? keys : Object.keys(item))
          .map((key) => {
            return getTerm(item, key, term);
          })
          .reduce((terms, term) => ({ ...terms, ...term }), {});
        return { ...item, terms };
      });
  }
};
