export enum ConfigKeys {
  TOKEN,
  CRYPTO_API_KEY,
  CRYPTO_MERCHANT_ID,
}

export interface IConfigService {
  get(key: keyof typeof ConfigKeys): string;
}
