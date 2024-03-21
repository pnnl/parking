import { generateState, OAuth2Provider, Tokens } from "arctic";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { parseJWT } from "oslo/jwt";
import { OAuth2Client, OAuth2RequestError } from "oslo/oauth2";

import prisma from "@/prisma";

import { registerProvider } from "../";
import { lucia } from "../lucia";

const authorizeEndpoint = "https://eams-auth.oneid.energy.gov/as/authorization.oauth2";
const tokenEndpoint = "https://eams-auth.oneid.energy.gov/as/token.oauth2";
const profileEndpoint = "https://eams-auth.oneid.energy.gov/idp/userinfo.openid";

export class OneID implements OAuth2Provider {
  client;
  clientSecret;
  constructor(
    clientId: string,
    clientSecret: string,
    options?: {
      redirectURI?: string;
    }
  ) {
    this.client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
      redirectURI: options?.redirectURI,
    });
    this.clientSecret = clientSecret;
  }
  async createAuthorizationURL(
    state: string,
    options?: {
      scopes?: string[];
    }
  ): Promise<URL> {
    return await this.client.createAuthorizationURL({
      state,
      scopes: options?.scopes ?? [],
    });
  }
  async validateAuthorizationCode(code: string): Promise<Tokens> {
    const result = await this.client.validateAuthorizationCode(code, {
      authenticateWith: "request_body",
      ...(this.clientSecret && { credentials: this.clientSecret }),
    });
    const tokens = {
      accessToken: result.access_token,
    };
    return tokens;
  }
}

export interface OneidUser {
  duid: string;
  name: string;
  email: string;
}

const oneid = new OneID(process.env.ONEID_CLIENT_ID ?? "", process.env.ONEID_CLIENT_SECRET ?? "", {
  redirectURI: process.env.ONEID_REDIRECT_URI,
});

registerProvider({
  name: "oneid",
  label: "OneID",
  credentials: {},
  callback: async (req: Request) => {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies().get("oneid_oauth_state")?.value ?? null;
    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }
    try {
      const tokens = await oneid.validateAuthorizationCode(code);
      const jwt = parseJWT(tokens.accessToken);
      let oneidUser: OneidUser | undefined = jwt?.payload as any;
      if (!oneidUser) {
        const profileResponse = await fetch(profileEndpoint, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        oneidUser = await profileResponse.json();
      }
      const { duid, name, email } = oneidUser ?? {};
      if (!(duid && name && email)) {
        return new Response(null, { status: 400 });
      }
      let user = await prisma.user.findFirst({
        where: { OR: [{ email: email }, { accounts: { some: { provider: "oneid", providerAccountId: duid } } }] },
        include: { accounts: { where: { provider: "oneid" } } },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: randomUUID(),
            scope: "",
          },
          include: { accounts: { where: { provider: "oneid" } } },
        });
      }
      if (!user.accounts) {
        const value = await prisma.account.create({
          data: {
            type: "oauth",
            provider: "oneid",
            providerAccountId: duid,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            sessionState: state,
            user: { connect: { id: user.id } },
          },
          include: { user: { include: { accounts: { where: { provider: "oneid" } } } } },
        });
        user = value.user;
      }
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        return new Response(null, {
          status: 401,
        });
      }
      return new Response(null, {
        status: 500,
      });
    }
  },
  authorize: async (_values) => {
    const state = generateState();
    const url = await oneid.createAuthorizationURL(state, { scopes: ["profile"] });
    return {
      cookie: [
        "oneid_oauth_state",
        state,
        {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: "lax",
        },
      ],
      redirect: url.toString(),
    };
  },
});
