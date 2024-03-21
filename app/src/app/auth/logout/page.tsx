import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authUser } from "@/auth";
import { lucia } from "@/auth/lucia";

export default async function Page() {
  return (
    <main>
      <div>
        <h2>Sign out</h2>
        <form action={logout()}>
          <button>Continue</button>
        </form>
      </div>
    </main>
  );
}

function logout() {
  return async function (_formData: FormData) {
    "use server";
    const authorize = async () => {
      const user = await authUser();
      if (user) {
        await lucia.invalidateUserSessions(user.id ?? "");
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        redirect("/");
      }
    };
    await authorize();
  };
}
