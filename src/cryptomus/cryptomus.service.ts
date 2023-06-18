import { CreatePaymentResult, ICryptomusService } from './cryptomus.interface';
import { ConfigService } from '../config/config.service';
import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

export class CryptomusService implements ICryptomusService {
  private apiKey: string;
  private merchantId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('CRYPTO_API_KEY');
    this.merchantId = this.configService.get('CRYPTO_MERCHANT_ID');
  }
  async checkPayment(uuid: string) {
    try {
      const payload = {
        uuid,
      };
      const { data } = await axios.post<CreatePaymentResult>(
        'https://api.cryptomus.com/v1/payment/info',
        payload,
        {
          headers: this.getHeader(JSON.stringify(payload)),
        }
      );
      return data;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async createPayment(amount: number, orderId: string) {
    try {
      const payload = {
        amount: amount.toString(),
        currency: 'USD',
        order_id: orderId,
      };
      const { data } = await axios.post<CreatePaymentResult>(
        'https://api.cryptomus.com/v1/payment',
        payload,
        {
          headers: this.getHeader(JSON.stringify(payload)),
        }
      );
      return data;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  getHeader(payload: string) {
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(payload).toString('base64') + this.apiKey)
      .digest('hex');
    return { sign, merchant: this.merchantId };
  }
}
