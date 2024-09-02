export type SubscriptionId = string;
export type PlanId = string;

export interface SubscriptionPlans {
  monthly: PayPalSubscriptionPlan;
  yearly: PayPalSubscriptionPlan;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface CreateSubscriptionBody {
  planId: string;
  subscriptionId: string;
  startDate: Date;
  status: string;
}

export interface PayPalSubscriptionPlan extends PayPalCreate {
  name: string;
  description?: string;
  create_time: string;
  update_time: string;
  usage_type: "LICENSED" | "UNLIMITED";
  billing_cycles: BillingCycle[];
  payment_preferences: PaymentPreferences;
  taxes?: Taxes;
  quantity_supported: boolean;
  product_id: string;
}

export interface PayPalCreate {
  id: string;
  status: string;
  links: PayPalLink[];
}

export interface PayPalCapture {
  id: string;
  status: string;
  create_time: string;
  debug_id?: string;
  details?: {
    issue: string;
    description: string;
  }[];
  payment_source: {
    paypal: {
      email_address: string;
      account_id: string;
      account_status: string;
      name: {
        given_name: string;
        surname: string;
      };
      address: {
        country_code: string;
      };
    };
  };
  purchase_units: {
    reference_id: string;
    shipping: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: {
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: string;
          dispute_categories: string[];
        };
        seller_receivable_breakdown: {
          gross_amount: {
            currency_code: string;
            value: string;
          };
          paypal_fee: {
            currency_code: string;
            value: string;
          };
          net_amount: {
            currency_code: string;
            value: string;
          };
          receivable_amount: {
            currency_code: string;
            value: string;
          };
          exchange_rate: {
            source_currency: string;
            target_currency: string;
            value: string;
          };
        };
        links: {
          href: string;
          rel: string;
          method: string;
        }[];
        create_time: string;
        update_time: string;
      }[];
    };
  }[];
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
    address: {
      country_code: string;
    };
  };
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
}

export interface BillingCycle {
  frequency: {
    interval_unit: "MONTH" | "YEAR";
    interval_count: number;
  };
  tenure_type: "REGULAR" | "TRIAL";
  sequence: number;
  total_cycles: number;
  pricing_scheme?: {
    fixed_price: {
      value: string;
      currency_code: "USD" | "ILS";
    };
  };
}

export interface PaymentPreferences {
  auto_bill_outstanding: boolean;
  setup_fee?: {
    value: string;
    currency_code: "USD" | "ILS";
  };
  setup_fee_failure_action?: string;
  payment_failure_threshold: number;
}

export interface Taxes {
  percentage: string;
  inclusive: boolean;
}

export interface CreateSubscriptionPlan {
  taxes: Taxes;
  name: string;
  product_id: string;
  description: string;
  billing_cycles: BillingCycle[];
  payment_preferences: PaymentPreferences;
}

export interface PayPalEventResponse {
  id: string;
  create_time: "subscription" | string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: PayPalSubscriptionResource;
  links: PayPalLink[];
  event_version: string;
  resource_version: string;
}

export interface PayPalSubscriptionResource {
  quantity: string;
  subscriber: PayPalSubscriber;
  create_time: string;
  shipping_amount: {
    currency_code: string;
    value: string;
  };
  start_time: string;
  update_time: string;
  billing_info: BillingInfo;
  links: PayPalLink[];
  id: string;
  plan_id: string;
  auto_renewal: boolean;
  status: string;
  status_update_time: string;
}

export interface PayPalSubscriber {
  name: {
    given_name: string;
    surname: string;
  };
  email_address: string;
  shipping_address: {
    name: {
      full_name: string;
    };
    address: {
      address_line_1: string;
      address_line_2?: string;
      admin_area_2: string;
      admin_area_1: string;
      postal_code: string;
      country_code: string;
    };
  };
}

export interface BillingInfo {
  outstanding_balance: {
    currency_code: string;
    value: string;
  };
  cycle_executions: CycleExecution[];
  last_payment: PaymentDetail; // Last payment made
  next_billing_time: string;
  final_payment_time: string; // Time of the final payment
  failed_payments_count: number;
}

export interface CycleExecution {
  tenure_type: "TRIAL" | "REGULAR";
  sequence: number;
  cycles_completed: number;
  cycles_remaining: number;
  current_pricing_scheme_version: number;
}

export interface PaymentDetail {
  amount: {
    currency_code: string;
    value: string;
  };
  time: string;
}

export interface PayPalSaleCompletedEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: PayPalSaleResource;
  links: PayPalLink[];
}

export interface PayPalSaleResource {
  billing_agreement_id: string;
  amount: {
    total: string;
    currency: string;
    details: {
      subtotal: string;
    };
  };
  payment_mode: string;
  update_time: string;
  create_time: string;
  protection_eligibility_type: string;
  transaction_fee: {
    currency: string;
    value: string;
  };
  protection_eligibility: string;
  links: PayPalLink[];
  id: string;
  state: string;
  invoice_number: string;
}

export type OnApproveData = {
  billingToken?: string | null;
  facilitatorAccessToken?: string;
  orderID: string;
  payerID?: string | null;
  paymentID?: string | null;
  subscriptionID?: string | null;
  authCode?: string | null;
};
