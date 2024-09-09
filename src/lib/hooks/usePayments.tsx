import axios from "axios";
import {
  OnApproveData,
  PayPalCapture,
  SubscriptionId,
  SubscriptionPlans,
} from "@/models/payment";
import { Logger } from "@/logger";

export default function usePayments() {
  const approveSubscription = async (
    data: OnApproveData,
  ): Promise<SubscriptionId> => {
    try {
      const result = await axios.post("/api/subscription/approve", { data });
      const subscriptionData = result.data;

      if (subscriptionData.id) {
        return subscriptionData.id;
      } else {
        const errorDetail = subscriptionData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${subscriptionData.debug_id})`
          : JSON.stringify(subscriptionData);

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Logger.error("Error approving subscription", { error });
      throw error;
    }
  };

  const getSubscriptionPlans = async (): Promise<SubscriptionPlans> => {
    try {
      const monthlyPlanId = process.env.NEXT_PUBLIC_PLAN_ID_MONTH;
      const annualPlanId = process.env.NEXT_PUBLIC_PLAN_ID_ANNUAL;
      const monthlyPlan = axios.get(`/api/subscription/${monthlyPlanId}`);
      const annualPlan = axios.get(`/api/subscription/${annualPlanId}`);
      const result = await Promise.all([monthlyPlan, annualPlan]);
      const monthly = result[0].data;
      const yearly = result[1].data;
      return {
        monthly,
        yearly,
      };
    } catch (error: any) {
      Logger.error("Error fetching subscription plans", { error });
      throw error;
    }
  };

  const createOrder = async (itemId: string, amount: number) => {
    try {
      const result = await axios.post("/api/order", {
        cart: {
          itemId,
          amount,
        },
      });
      const orderData = result.data;

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Logger.error("Error creating order", { error });
      throw error;
    }
  };

  const createSubscription = async (subscriptionId: SubscriptionId) => {
    try {
      const result = await axios.post("/api/subscription", {
        subscriptionId,
      });
      const subscription = result.data;
      return subscription.id;
    } catch (error: any) {
      Logger.error("Error creating order", { error });
      throw error;
    }
  };

  const approveOrder = async (orderId: string): Promise<PayPalCapture> => {
    try {
      const response = await axios.post<PayPalCapture>(
        `/api/orders/${orderId}/capture`,
      );
      return response.data;
    } catch (error: any) {
      Logger.error("Error approving order", { error });
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await axios.post(`/api/orders/${orderId}/cancel`);
    } catch (error: any) {
      Logger.error("Error cancelling order", { error });
      throw error;
    }
  };

  return {
    approveOrder,
    approveSubscription,
    createSubscription,
    cancelOrder,
    createOrder,
    getSubscriptionPlans,
  };
}
