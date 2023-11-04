import { Telegraf } from 'telegraf'

import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'

const accountRepo = new AccountRepositoryImpl();

class CheckSizeCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
  ) {
    super(bot);
  }

  handle() {

    this.bot.command(CommandConstants.CheckSize, async ctx => {
       const currentUser = await accountRepo.findById(BigInt(ctx.message.from.id))
       //currentUser?.Connections.
       ctx.reply(currentUser?.Connections.length ? 'Select the needed connection' : 'You do not have connections', {reply_markup: {
        inline_keyboard: [(currentUser?.Connections ?? []).map(item => (
          {text: 'db ' + item.Database, callback_data: item.Id,}
          ))],
      }})

      currentUser?.Connections

      for(const item of (currentUser?.Connections ?? [])) {
        this.bot.action(item.Id, async ctx => {
          const clinet = new DbClientService(
            {
              database: item.Database,
              host: item.Host,
              password: item.Password,
              port: item.Port,
              user: item.User
            })
            const res = await clinet.execute("SELECT pg_size_pretty(pg_database_size('`${item.Database}`'))")
            console.log(res)
            ctx.reply(JSON.stringify(res))
        })
      }
      
    })
  }
}

export const initCheckSizeCommand =
  () => (bot: Telegraf<IBotContext>) =>
    new CheckSizeCommand(bot);

