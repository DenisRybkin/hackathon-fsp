import { CommandBase } from './base/command.base';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';

class StartCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    /* TODO: mb add prisma client for store credentials of db instances*/
  ) {
    super(bot);
  }
  handle() {
    this.bot.start(async ctx => {
      ctx.reply('Salam!');
    });
  }
}

export const initStartCommand =
  (/* TODO: mb add prisma client for store credentials of db instances*/) =>
  (bot: Telegraf<IBotContext>) =>
    new StartCommand(bot);
