import { apiClient } from "./client";
import type { Payment } from "@/types/payment";

export const paymentApi = {
  listPayments: () => apiClient.get<Payment[]>("/payment/payments/"),
};
