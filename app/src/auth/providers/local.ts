import bcrypt from "bcrypt";
import { pick } from "lodash";

import prisma from "@/prisma";

import { registerProvider } from "../";

registerProvider({
  name: "local",
  label: "Local",
  credentials: {
    email: { label: "Email", type: "text" as const, placeholder: "email" },
    password: { label: "Password", type: "password" as const },
  },
  authorize: async (values) => {
    // always look up a user and hash passwords to prevent brute force algorithms from determining valid emails by response speed
    const user = await prisma.user.findUnique({ where: { email: values?.email ?? "" } });
    const authorized = await bcrypt.compare(values?.password ?? "", user?.password ?? "");
    if (values?.password && user && authorized) {
      return { user: pick(user, ["id", "name", "email", "scope"]), redirect: "/" };
    } else {
      return {};
    }
  },
});
