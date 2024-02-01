import { type DefaultSession } from "next-auth";
import { User } from "@prisma/client";
import { DefaultJWT } from "next-auth/jwt";
import { RoleEnum } from "@/common/types";

export type AuthRoles = {
  [key in RoleEnum]: boolean;
};

export interface AuthUser {
  id?: string;
  roles: AuthRoles;
}

export type SessionUser = Pick<User, "id" | "scope"> & DefaultSession["user"];

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user?: SessionUser;
  }

  interface JWT extends DefaultJWT {
    id: string;
    scope: string;
  }
}
