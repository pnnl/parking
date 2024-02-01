import { IBase, IGranted, IRole, RoleEnum } from "../types";
import { intersection, merge } from "lodash";

import Base from "./base";

class Role extends Base<IRole> implements IBase<IRole> {
  constructor() {
    super(
      [
        {
          name: "admin",
          label: "Admin",
          grants: ["user"],
          enum: RoleEnum.Admin,
        },
        {
          name: "user",
          label: "User",
          grants: [],
          enum: RoleEnum.User,
        },
      ]
        .map((r) => merge(r, { granted: ((...v) => this.granted(r as IRole, ...v)) as IGranted }))
        .map((v) => Object.freeze(merge(v, { grants: Object.freeze(v.grants) })))
    );
  }

  // static references to objects
  Admin = this.parseStrict("admin");
  AdminType = this.parseStrict("admin");
  User = this.parseStrict("user");
  UserType = this.parseStrict("user");

  /**
   * Determines if the a role is granted by the b role(s).
   * I.e. Is the role lead granted to roles user and status?
   * Written as: `role.granted("lead", "user", "status") === false`
   */
  granted = (a: IRole | number | string, ...b: Array<IRole | number | string>): boolean => {
    const name = this.parse(a)?.name;
    const roles = b.map((v) => this.parse(v)?.name).filter((v) => v);
    const granted = this.values.filter((v) => v.name === name || v.grants.includes(name ?? "")).map((v) => v.name);
    return intersection(roles, granted).length > 0;
  };
}

const role = new Role();

export default role;
