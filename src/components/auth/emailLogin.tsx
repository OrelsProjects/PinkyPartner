import { useFormik } from "formik";
import React from "react";
import useAuth from "../../lib/hooks/useAuth";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SignInForm {
  email: string;
  password: string;
}

interface EmailLoginProps {
  className?: string;
}

export default function EmailLogin({ className }: EmailLoginProps) {
  const { signUpWithEmail } = useAuth();
  const formik = useFormik<SignInForm>({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async values => {
      if (values.email && values.password) {
        toast.promise(signUpWithEmail(values.email, values.password), {
          pending: "Signing in...",
          success: "Signed in!",
          error: {
            render(e: any) {
              return "Failed to sign in";
            },
          },
        });
      }
    },
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className={`w-full flex flex-col gap-4 ${className}`}
    >
      <Input
        type="email"
        placeholder="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        name="email"
      />
      <Input
        type="password"
        placeholder="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        name="password"
      />
      <Button
        type="submit"
        className="w-full h-12 rounded-lg"
      >
        Sign in →
      </Button>
    </form>
  );
}
