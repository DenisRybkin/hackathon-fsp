import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { CommandBase } from './base/command.base';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository';
import { CommandConstants } from './constants/commands.constants';
import { screenshoter } from '../services/screenshot.service';

const accountRepo = new AccountRepositoryImpl();
const connectionRepo = new ConnectionRepositoryImpl();

export class GetDashboardCommand extends CommandBase {
  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }

  handle(): void {
    this.bot.command(CommandConstants.GetDashboard, async ctx => {
      const { id } = ctx.message.from;
      const connectionId = 'df60c546-188c-4365-a5b6-26377739ec0f';

      const account = await accountRepo.findById(BigInt(id));

      if (!account) return ctx.reply('No such account');

      const connection = account?.Connections.find(
        ({ Id }) => Id === connectionId
      );

      if (!connection?.Dashboard)
        return ctx.reply('This connection has no dashboard');

      ctx.reply('Loading...');
      try {
        const { buffer, path } = await screenshoter.save(connection.Dashboard);
        ctx.sendPhoto({ source: buffer, filename: path });
      } catch (_) {
        ctx.reply('Something went wrong');
      }
    });
  }
}

export const initGetDashboardCommand = () => (bot: Telegraf<IBotContext>) =>
  new GetDashboardCommand(bot);

