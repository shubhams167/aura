import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface AuthPageWrapperProps {
  children: React.ReactNode;
}

export default async function AuthPageWrapper({
  children,
}: AuthPageWrapperProps) {
  const session = await auth();

  // Redirect to home if already logged in
  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
