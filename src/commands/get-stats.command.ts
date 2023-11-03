import { NarrowedContext, Telegraf } from 'telegraf';
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram';
import { IBotContext } from '../context/context.interface';
import { DbClientService } from '../database/db-client.service';
import { CommandBase } from './base/command.base';
import { CommandConstants } from './constants/commands.constants';

export type ctxType = NarrowedContext<
  IBotContext,
  | Update.CallbackQueryUpdate<CallbackQuery>
  | {
      message: any;
      update_id: number;
    }
>;

class GetStatsCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    private readonly dbClient: DbClientService
  ) {
    super(bot);
    this.initActions();
    this.initHears();
  }

  private async sendStatActivity(ctx: ctxType) {
    const res = await this.dbClient.getStatsActivity();
    for (let i = 0; i < res.length; i++) {
      ctx.reply(JSON.stringify(res[i]));
    }
  }

  private initHears() {
    this.bot.hears('Get Stats Activity', this.sendStatActivity.bind(this));
  }

  private initActions() {
    this.bot.action(
      CommandConstants.GetStats,
      this.sendStatActivity.bind(this)
    );
  }

  handle() {
    this.bot.command(CommandConstants.GetStats, async ctx => {
      const res = await this.dbClient.getStatsActivity();
      for (let i = 0; i < res.length; i++) {
        ctx.reply(JSON.stringify(res[i]));
      }
    });
  }
}

export const initGetStatsCommand =
  (dbClient: DbClientService) => (bot: Telegraf<IBotContext>) =>
    new GetStatsCommand(bot, dbClient);

