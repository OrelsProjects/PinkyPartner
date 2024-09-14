import { useFormik } from "formik";
import React from "react";
import useAuth from "@/lib/hooks/useAuth";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SignInForm {
  email: string;
  password: string;
  displayName?: string;
}

interface EmailLoginProps {
  className?: string;
  register?: boolean;
}

export default function EmailLogin({ className, register }: EmailLoginProps) {
  const { signUpWithEmail } = useAuth();
  const formik = useFormik<SignInForm>({
    initialValues: {
      email: "",
      password: "",
      displayName: "",
    },
    onSubmit: async values => {
      if (values.email && values.password) {
        toast.promise(
          signUpWithEmail(values.email, values.password, register),
          {
            pending: "Signing in...",
            success: "Signed in!",
            error: {
              render(e: any) {
                return "Failed to sign in";
              },
            },
          },
        );
      }
    },
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className={`w-full flex flex-col gap-4 ${className}`}
    >
      {register && (
        <Input
          type="text"
          placeholder="Display Name"
          value={formik.values.displayName}
          onChange={formik.handleChange}
          name="displayName"
          required
        />
      )}
      <Input
        type="email"
        placeholder="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        name="email"
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        name="password"
        required
      />
      <Button type="submit" className="w-full h-12 rounded-lg">
        Sign in →
      </Button>
    </form>
  );
}
