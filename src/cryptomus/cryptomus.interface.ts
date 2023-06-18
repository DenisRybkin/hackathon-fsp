export interface ICryptomusService {
  getHeader(payload: string): { sign: string; merchant: string };
  createPayment(
    amount: number,
    orderId: string
  ): Promise<CreatePaymentResult | undefined>;
  checkPayment(uuid: string): Promise<CreatePaymentResult | undefined>;
}
export interface CreatePaymentResult {
  state: number;
  result: Result;
}

export interface Result {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payer_amount: string;
  payer_currency: string;
  currency: string;
  network: string;
  payment_status: string;
  url: string;
  expired_at: number;
  status: string;
  is_final: boolean;
  currencies: Currency[];
}

export interface Currency {
  currency: string;
  network: string;
}
