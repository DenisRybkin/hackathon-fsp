import { DotenvParseOutput, config } from 'dotenv';
import { ConfigKeys, IConfigService } from './config.interface';

export class ConfigService implements IConfigService {
  private readonly config: DotenvParseOutput;

  constructor() {
    const { error, parsed } = config();
    if (error) throw new Error('Not found environment');
    if (!parsed) throw new Error('Environment is empty');
    this.config = parsed;
  }

  get(key: keyof typeof ConfigKeys) {
    const res = this.config[key];
    if (!res) throw new Error('Method not implemented.');
    return res;
  }
}
