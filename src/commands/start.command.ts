import { Telegraf } from 'telegraf'

import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'

class StartCommand extends CommandBase {

  constructor(
    bot: Telegraf<IBotContext>,
    private readonly dbClient: DbClientService
  ) {
    super(bot);
  }

  handle() {
    this.bot.start(async ctx => {
      ctx.reply('How can I help?', {reply_markup: {
        inline_keyboard: [
          [
            { text: "Stats activity", callback_data: CommandConstants.GetStats },
          ],
        ]
      }
    }) 
    }
   );
  }
}

export const initStartCommand =
  (dbClient: DbClientService) =>
  (bot: Telegraf<IBotContext>) =>
    new StartCommand(bot,dbClient);
