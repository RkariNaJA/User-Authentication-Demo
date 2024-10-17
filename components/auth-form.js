"use client";
import Link from "next/link";
import { useFormState } from "react-dom"; //Can be use only in a client side

import { auth } from "@/action/auth-actions";

// mode = "login", "signup"
export default function AuthForm({ mode }) {
  const [formState, formAction] = useFormState(auth.bind(null, mode), {}); //Use bind to preconfigure functions
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        //Validating User Input
        <ul id="form-errors">
          {/*Converts a list of keys into an array*/}
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}{" "}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === "login" ? "login" : "Create Account"}
        </button>
      </p>
      <p>
        {mode === "login" && (
          <Link href="/?mode=signup">Create an account.</Link>
        )}
        {mode === "signup" && (
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
