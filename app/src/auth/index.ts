import { merge } from "lodash";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { RoleType } from "@/common";
import { deepFreeze } from "@/utils/util";

import { lucia } from "./lucia";
import { AuthRoles, AuthUser, Credentials, Provider } from "./types";

const available = (process.env.AUTH_PROVIDERS ?? "")
  .split(/[, |]+/)
  .map((v) => v.trim())
  .filter((v) => v.length > 0);
const authenticate = available.length > 0;

const providers: Map<string, Provider<Credentials>> = new Map<string, Provider<Credentials>>();

const getProvider = (name: string) => {
  const provider = providers.get(name);
  return provider ? (deepFreeze(provider) as Readonly<Provider<Credentials>>) : undefined;
};

const getProviders = () => deepFreeze(available) as Readonly<string[]>;

const registerProvider = (provider: Provider<Credentials>) => providers.set(provider.name, provider);

const authRoles = (scope: string) => {
  const scopes = scope.split(/[, |]+/);
  return RoleType.values.reduce(
    (a, v) => merge(a, { [v.enum]: authenticate ? v.granted(...scopes) ?? false : true }),
    {} as AuthRoles
  );
};

const authUser = async (req?: NextApiRequest | NextRequest): Promise<AuthUser> => {
  "use server";
  let id: string | undefined = undefined;
  let scope: string | undefined = undefined;
  if (authenticate) {
    let sessionId: string | null | undefined = undefined;
    let authorization: string | null | undefined = undefined;
    if (req instanceof NextRequest) {
      sessionId = req.cookies.get(lucia.sessionCookieName)?.value ?? null;
      authorization = req.cookies.get("Authorization")?.value ?? null;
    } else if (req !== undefined) {
      sessionId = req.cookies[lucia.sessionCookieName] ?? null;
      authorization = req.cookies["Authorization"] ?? null;
    } else {
      sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
      authorization = cookies().get("Authorization")?.value ?? null;
    }
    if (sessionId === null && authorization !== null && available.includes("bearer")) {
      sessionId = lucia.readBearerToken(authorization);
    }
    if (sessionId) {
      const { session, user } = await lucia.validateSession(sessionId);
      if (session && user) {
        id = user.id;
        scope = user.scope ?? undefined;
      }
    }
  }
  return {
    id,
    roles: authRoles(scope ?? ""),
  };
};

export { authenticate, getProvider, getProviders, registerProvider, authUser, authRoles };

import("./providers");
