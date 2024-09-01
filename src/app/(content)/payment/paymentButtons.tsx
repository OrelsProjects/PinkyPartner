import {
  PayPalButtons,
  PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import React from "react";

export interface PaymentButtonsProps extends PayPalButtonsComponentProps {
  subscription?: {
    planId: string;
  };
}

export default function PaymentButtons({
  subscription,
  createOrder,
  createSubscription,
  ...props
}: PaymentButtonsProps) {
  return subscription ? (
    <PayPalButtons
      createSubscription={createSubscription}
      createOrder={undefined}
      {...props}
    />
  ) : (
    <PayPalButtons
      createOrder={createOrder}
      createSubscription={undefined}
      {...props}
    />
  );
}
