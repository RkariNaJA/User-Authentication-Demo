import AuthForm from "@/components/auth-form";

//special prop thats nextjs added automatically to all page components
export default async function Home({ searchParams }) {
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
