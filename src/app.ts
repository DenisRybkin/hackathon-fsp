import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { BotCommand } from 'telegraf/typings/core/types/typegram';
import { InitCommandType, initializersCommands } from './commands';
import { CommandBase } from './commands/base/command.base';
import { CommandConstants } from './commands/constants/commands.constants';
import { getMainMenu } from './commands/keyboards/mainMenu.keyboard';
import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { IBotContext } from './context/context.interface';
import { CronService } from './cron/cron.service';
import { DbClientService, ICredentialsDB } from './database/db-client.service';

const hintCommands: BotCommand[] = [
  {
    command: '/start',
    description: 'Saving user account & menu',
  },
  {
    command: '/' + CommandConstants.AddConnection,
    description: 'Adding connection (pool) to DB',
  },
];

export class Bot {
  bot: Telegraf<IBotContext>;
  commands: CommandBase[];
  constructor(
    private readonly configService: IConfigService,
    private readonly initializersCommands: Array<InitCommandType>
  ) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
    this.bot.telegram.setMyCommands(hintCommands);
    this.bot.use(new LocalSession({ database: 'sessions.json' }).middleware());
    this.commands = initializersCommands.map(init => init(this.bot));
  }

  async init() {
    await new CronService(
      // this.databaseService,
      // this.cryptomusService,
      this.bot
    ).init();
    //await this.databaseService.init();
    for (const command of this.commands) command.handle();
    await this.bot.launch();
    this.bot.start(ctx => {
      ctx.reply('Hello!', getMainMenu());
    });
  }
}

const configService = new ConfigService();

export const bot = new Bot(configService, initializersCommands());

bot.init();

