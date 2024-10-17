"use server";
import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getuserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

//Must be asunc function

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  /*Converts a list of keys into an array*/
  if (Object.keys(errors).length > 0) {
    return {
      errors: errors,
    };
  }
  //Store it in the database (create anew user)
  const hashedPassword = hashUserPassword(password);
  //To check if the email is alredy exists
  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id); //Create session when a new user is created
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email:
            "It seems like an account for the chosen email already exists.",
        },
      };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getuserByEmail(email); //Getting user email, password and id from database

  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user, please check your credentials.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);
  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate user, please check your credentials.",
      },
    };
  }
  await createAuthSession(existingUser.id); //Create session when a new user is created
  redirect("/training");
}

//To call the appropriate server action depending on the mode
export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return signup(prevState, formData);
}
export async function logout() {
  await destroySession();
  redirect("/");
}
