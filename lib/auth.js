import { Lucia } from "lucia"; //Store session in database
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";
import { cookies } from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});
// To create session and session cookies and to validate incoming requests
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production", // Running the app on production and the cookies to only work across HTTPS.
    },
  },
});

// Create session
export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {}); // Create a new entry sessino and new unique session id in database table
  const sessionCookie = lucia.createSessionCookie(session.id); // Give an object that holds all the data that should be set on that session cookie
  //Outgoing response
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  ); // To access the cookie that belongs to the outgoing response ; To set new cookies on that response,
}

export async function verifyAuth() {
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }
  const sessionId = sessionCookie.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }
  const result = await lucia.validateSession(sessionId); //To check if a session with that id is in the databse or not

  try {
    //Recreate cookies for the existing active session
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    // To clear a non-valid cookie session
    if (!result.session) {
      //Clear and recreated the new cookies
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}
  return result;
}
export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized!",
    };
  }
  await lucia.invalidateSession(session.id); //Reach out to that session database table and delete the session from there
  const sessionCookie = lucia.createBlankSessionCookie(); //Clear and recreated the new cookies
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
