import { registerProvider } from "../";

registerProvider({
  name: "bearer",
  label: "Bearer",
  credentials: {},
  authorize: async (_values) => {
    return { redirect: "/" };
  },
});
