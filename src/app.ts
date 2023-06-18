import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.interface';
import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IBotContext } from './context/context.interface';
import { CommandBase } from './commands/base/command.base';
import { InitCommandType, initializersCommands } from './commands';
import { DatabaseService } from './database/database.service';
import { CryptomusService } from './cryptomus/cryptomus.service';
import { IDatabase } from './database/database.interface';
import { CronService } from './cron/cron.service';

export class Bot {
  bot: Telegraf<IBotContext>;
  commands: CommandBase[];
  constructor(
    private readonly configService: IConfigService,
    private readonly databaseService: IDatabase,
    private readonly cryptomusService: CryptomusService,
    private readonly initializersCommands: Array<InitCommandType>
  ) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
    this.bot.use(new LocalSession({ database: 'sessions.json' }).middleware());
    this.commands = initializersCommands.map(init => init(this.bot));
  }

  async init() {
    await new CronService(
      this.databaseService,
      this.cryptomusService,
      this.bot
    ).init();
    await this.databaseService.init();
    for (const command of this.commands) command.handle();
    this.bot.launch();
  }
}

const configService = new ConfigService();
const database = new DatabaseService();
const cryptomusService = new CryptomusService(configService);

export const bot = new Bot(
  configService,
  database,
  cryptomusService,
  initializersCommands(cryptomusService, database)
);
bot.init();
