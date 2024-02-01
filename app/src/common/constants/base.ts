import { IBase, IConstant, IMatcher, IParse, IParseStrict } from "../types";
import { has, isNumber, isString, merge } from "lodash";

abstract class Base<T extends IConstant> implements IBase<T> {
  private _matcher: IMatcher = (v) => v;
  private _values: Array<T>;
  private _constants: { [key: string]: T };
  private _keys: Array<keyof T>;

  constructor(values: Array<T>) {
    if (!values?.length) {
      throw new Error("Values with at least one item must be specified.");
    }
    this._values = values;
    this._constants = values.reduce((p, c) => merge(p, merge({ [c.name]: c }, { [c.label]: c })), {});
    this._keys = (Object.keys(values[0]) as Array<keyof T>).filter((k) => isString(values[0][k]));
  }

  /**
   * Process all values using this function when matching them.
   */
  public get matcher() {
    return this._matcher;
  }

  /**
   * Process all values using this function when matching them.
   */
  public set matcher(matcher: IMatcher) {
    this._matcher = matcher;
  }

  /**
   * Get a list of the values.
   */
  public get values() {
    return this._values;
  }

  /**
   * Get a map of the value names and labels.
   */
  public get constants() {
    return this._constants;
  }

  parse: IParse<T> = (value) => {
    let parsed = undefined;
    if (isNumber(value)) {
      parsed = this._values[value];
    } else if (has(value, ["name"])) {
      parsed = this.parse((value as IConstant).name);
    } else if (isString(value)) {
      parsed = this._constants[value];
      if (!parsed) {
        const t = this._matcher(value);
        parsed = this._values.find((v) => this._keys.map((k) => this._matcher(v[k] as string)).includes(t));
      }
    }
    return parsed;
  };

  parseStrict: IParseStrict<T> = (value) => {
    const parsed = this.parse(value);
    if (!parsed) {
      throw new Error(`Unknown constant for ${value}.`);
    }
    return parsed;
  };
}

export default Base;
