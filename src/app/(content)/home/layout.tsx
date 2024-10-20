import { Metadata } from "next";
import React from "react";
import PaymentProvider from "./PaymentProvider";

export const metadata: Metadata = {
  title: "Home",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PaymentProvider />
      {children}
    </>
  );
}
