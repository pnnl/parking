import { IAllowed, IBase, INormalization, IProcess } from "../types";
import { get, intersection, intersectionWith, isEmpty, isNil, merge } from "lodash";

import Base from "./base";
import xregexp from "xregexp";

const processLettersAndNumbers = (v: string | undefined | null) =>
  isNil(v) ? "" : xregexp.replace(v, xregexp("[^\\s\\p{L}0-9]", "gm"), "");

class Normalization extends Base<INormalization> implements IBase<INormalization> {
  constructor() {
    super(
      [
        {
          name: "NFD",
          label: "NFD",
          unallowed: ["NFC", "NFKD", "NFKC"],
          process: ((v) => (isNil(v) ? "" : v.normalize("NFD"))) as IProcess,
        },
        {
          name: "NFC",
          label: "NFC",
          unallowed: ["NFD", "NFKD", "NFKC"],
          process: ((v) => (isNil(v) ? "" : v.normalize("NFC"))) as IProcess,
        },
        {
          name: "NFKD",
          label: "NFKD",
          unallowed: ["NFD", "NFC", "NFKC"],
          process: ((v) => (isNil(v) ? "" : v.normalize("NFKD"))) as IProcess,
        },
        {
          name: "NFKC",
          label: "NFKC",
          unallowed: ["NFD", "NFC", "NFKD"],
          process: ((v) => (isNil(v) ? "" : v.normalize("NFKC"))) as IProcess,
        },
        {
          name: "LOWERCASE",
          label: "Lowercase",
          unallowed: ["UPPERCASE"],
          process: ((v) => (isNil(v) ? "" : v.toLowerCase())) as IProcess,
        },
        {
          name: "UPPERCASE",
          label: "Uppercase",
          unallowed: ["LOWERCASE"],
          process: ((v) => (isNil(v) ? "" : v.toUpperCase())) as IProcess,
        },
        {
          name: "LETTERS",
          label: "Letters",
          unallowed: [],
          process: ((v) => (isNil(v) ? "" : xregexp.replace(v, xregexp("[^\\s\\p{L}]", "gm"), ""))) as IProcess,
        },
        {
          name: "NUMBERS",
          label: "Numbers",
          unallowed: [],
          process: ((v) => (isNil(v) ? "" : xregexp.replace(v, /[^\s0-9]/gm, ""))) as IProcess,
        },
        {
          name: "TRIM",
          label: "Trim",
          unallowed: ["CONCATENATE"],
          process: ((v) => (isNil(v) ? "" : v.trim())) as IProcess,
        },
        {
          name: "COMPACT",
          label: "Compact",
          unallowed: ["CONCATENATE"],
          process: ((v) => (isNil(v) ? "" : xregexp.replace(v, /\s+/gm, " "))) as IProcess,
        },
        {
          name: "CONCATENATE",
          label: "Concatenate",
          unallowed: ["TRIM", "COMPACT"],
          process: ((v) => (isNil(v) ? "" : xregexp.replace(v, /\s+/gm, ""))) as IProcess,
        },
      ]
        .map((r) =>
          merge(r, {
            allowed: (r.unallowed.length === 0
              ? (_v) => true
              : (...v) => this.allowed(r as INormalization, ...v)) as IAllowed<INormalization>,
          })
        )
        .map((v) => Object.freeze(merge(v, { unallowed: Object.freeze(v.unallowed) })))
    );
  }

  // static references to objects
  NFD = this.parseStrict("NFD");
  NFDType = this.parseStrict("NFD");
  NFC = this.parseStrict("NFC");
  NFCType = this.parseStrict("NFC");
  NFKD = this.parseStrict("NFKD");
  NFKDType = this.parseStrict("NFKD");
  NFKC = this.parseStrict("NFKC");
  NFKCType = this.parseStrict("NFKC");
  Lowercase = this.parseStrict("Lowercase");
  LowercaseType = this.parseStrict("Lowercase");
  Uppercase = this.parseStrict("Uppercase");
  UppercaseType = this.parseStrict("Uppercase");
  Letters = this.parseStrict("Letters");
  LettersType = this.parseStrict("Letters");
  Numbers = this.parseStrict("Numbers");
  NumbersType = this.parseStrict("Numbers");
  Trim = this.parseStrict("Trim");
  TrimType = this.parseStrict("Trim");
  Compact = this.parseStrict("Compact");
  CompactType = this.parseStrict("Compact");
  Concatenate = this.parseStrict("Concatenate");
  ConcatenateType = this.parseStrict("Concatenate");

  /**
   * Determines if the a normalization is allowed by the b normalization(s).
   */
  allowed = (a: INormalization | number | string, ...b: Array<INormalization | number | string>): boolean => {
    const normalizations = b.map((v) => this.parse(v)?.name).filter((v) => v);
    const allowed = this.parse(a)?.unallowed || [];
    return isEmpty(intersection(normalizations, allowed));
  };

  /**
   * Create a normalization function for the specified normalization types.
   */
  process = (...types: Array<INormalization | number | string>): IProcess => {
    const joined = types.map((t) => get(t, ["label"], t)).join("|");
    const normalize = intersectionWith(
      this.values,
      joined.split(/[^a-zA-Z']+/).map((s) => this.parse(s)),
      (a, b) => a?.name === b?.name
    );
    return (value) => {
      return normalize.reduce((p, n, i, a) => {
        if (
          (n.name === "LETTERS" && get(a, [i + 1, "name"]) === "NUMBERS") ||
          (n.name === "NUMBERS" && get(a, [i - 1, "name"]) === "LETTERS")
        ) {
          return processLettersAndNumbers(p);
        }
        return n.process(p);
      }, value);
    };
  };
}

const normalization = new Normalization();

export default normalization;
