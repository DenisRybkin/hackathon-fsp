import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'

class GetStatsCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    private readonly dbClient: DbClientService
  ) {
    super(bot);
  }
  handle() {
    this.bot.command(CommandConstants.GetStats, async ctx => {
      const res = await this.dbClient.execute('SELECT * FROM pg_stat_activity;')
      const transformedRes =  res.rows.filter(item => item.datname == 'r-journal1').map(item => ({
        datid: item.datid,
				datname: item.datname,
				pid: item.pid,
				usename: item.usename,
				application_name: item.application_name,
        query_start: item.query_start,
				state_change: item.state_change,
				state: item.state
        //query: item.query

      }))
      console.log(transformedRes)
      for (let i = 0; i < transformedRes.length; i++) {
				ctx.reply(JSON.stringify(transformedRes[i]))
			}
    })
  }
}

export const initGetStatsCommand =
  (dbClient: DbClientService) =>
  (bot: Telegraf<IBotContext>) =>
    new GetStatsCommand(bot,dbClient);
