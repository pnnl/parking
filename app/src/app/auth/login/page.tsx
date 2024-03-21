import { getProviders } from "@/auth";

import Login from "../[provider]/login/page";

export default async function Page() {
  const providers = getProviders();
  return (
    <main>
      <ul>
        {providers.map((p) => (
          <li key={p}>
            <Login key={p} params={{ provider: p }} />
          </li>
        ))}
      </ul>
    </main>
  );
}
