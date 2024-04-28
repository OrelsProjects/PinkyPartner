"use client";

import { Button } from "../../../components/ui/button";
import { ThemeToggle } from "../../../components/theme-toggle";
import useAuth from "../../../lib/hooks/useAuth";

const Auth = () => {
  const { signInWithGoogle } = useAuth();

  const login = async () => {
    await signInWithGoogle();
  };
  return (
    <div className="flex flex-col items-center h-screen p-8 text-center">
      <Button onClick={login}>Google</Button>
      <ThemeToggle />
    </div>
  );
};

export default Auth;
