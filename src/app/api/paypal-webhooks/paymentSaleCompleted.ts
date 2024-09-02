import { NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { PayPalSaleCompletedEvent } from "../../../models/payment";

export async function handlePaymentSaleCompleted(
  event: PayPalSaleCompletedEvent,
) {
  try {
    const existingPayment = await prisma.payment.findFirst({
      where: { paymentId: event.resource.id },
    });

    if (existingPayment) {
      return NextResponse.json(
        { message: "Payment already exists", existingPayment },
        { status: 200 },
      );
    }

    const payment = await prisma.payment.create({
      data: {
        subscriptionId: event.resource.billing_agreement_id, // Assuming you link payment to subscription by ID
        paymentId: event.resource.id,
        paidAmount: parseFloat(event.resource.amount.total),
        paymentStatus: event.resource.state,
        paymentDate: new Date(event.resource.create_time),
      },
    });

    await prisma.subscription.update({
      where: { subscriptionId: event.resource.billing_agreement_id },
      data: { status: event.resource.state },
    });

    return NextResponse.json(
      { message: "Payment processed successfully", payment },
      { status: 200 },
    );
  } catch (error) {
    Logger.error("Error handling payment sale completed", "system-webhook", {
      data: { error },
    });
    return NextResponse.json(
      { error: "Failed to handle payment sale completed" },
      { status: 500 },
    );
  }
}
