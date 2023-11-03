import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.interface';
import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IBotContext } from './context/context.interface';
import { CommandBase } from './commands/base/command.base';
import { InitCommandType, initializersCommands } from './commands';
import { CronService } from './cron/cron.service';
import {DbClientService, ICredentialsDB} from "./database/db-client.service";

export class Bot {
  bot: Telegraf<IBotContext>;
  commands: CommandBase[];
  constructor(
    private readonly configService: IConfigService,
    private readonly initializersCommands: Array<InitCommandType>
  ) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
    this.bot.use(new LocalSession({ database: 'sessions.json' }).middleware());
    this.commands = initializersCommands.map(init => init(this.bot));
  }

  async init() {

    const mockCredentialsDB: ICredentialsDB[] = [{
      port: 5432,
      user: 'postgres',
      password: 'deniskaSUPER12345',
      database: 'r-journal1',
      host: 'localhost'
    }]

    const clients = mockCredentialsDB.map(creds => new DbClientService(creds))

    await new CronService(
      // this.databaseService,
      // this.cryptomusService,
      this.bot
    ).init();
    //await this.databaseService.init();
    for (const command of this.commands) command.handle();
    await this.bot.launch();
  }
}

const configService = new ConfigService();

export const bot = new Bot(
  configService,
  initializersCommands()
);
bot.init();
