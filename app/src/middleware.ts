import { difference, flattenDeep } from "lodash";

import { RoleType } from "@/common";
import { authenticate } from "./auth/util";
import { withAuth } from "next-auth/middleware";

const pathAuth = new RegExp(`^(?:/api)?/(${RoleType.values.map((v) => v.name).join("|")})/`);

export default withAuth(
  function middleware(_req) {
    // console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const parser =
          /^(?:(http[s]?|ftp):\/)?\/?([^:\/\s]+)(?::(\d+))?((?:\/\w+)*\/)?([\w\-\.]+[^#?\s]+)?(\?[^#]*)?(#[\w\-]+)?$/;
        if (!parser.test(req.url)) {
          // use console log to reduce middleware size
          console.log(`Request url failed to parse correctly for authentication: ${req.url}`);
          return false;
        }
        const [_url, _proto, _host, _port, path, _file, _query, _hash] = parser.exec(req.url) ?? [];
        const [_path, auth] = pathAuth.exec(path ?? "") ?? [];
        return authenticate && auth
          ? RoleType.parse(auth)?.granted(...((token?.scope as string | undefined) ?? "").split(/[, |]+/)) ?? false
          : true;
      },
    },
  }
);

export const config = {
  matcher: [`/api/admin/(.*)`, `/admin/(.*)`, `/api/user/(.*)`, `/user/(.*)`],
  unstable_allowDynamic: [
    "/node_modules/xregexp/**",
    "/node_modules/core-js-pure/**",
    "/node_modules/lodash/**",
    "/src/common/constants/**",
  ],
};

const missing = difference(
  config.matcher,
  flattenDeep(RoleType.values.map((v) => [`/api/${v.name}/(.*)`, `/${v.name}/(.*)`]))
);
if (missing.length > 0) {
  console.warn(`Missing middleware authentication routes for: ${missing.join(", ")}`);
}
