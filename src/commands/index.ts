import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { initAddConnectionCommand } from './add-connection.command'
import { CommandBase } from './base/command.base'
import { initGetStatsCommand } from './get-stats.command'
import { initStartCommand } from './start.command'

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export const initializersCommands: (
  dbClient: DbClientService
) => Array<InitCommandType> = (dbClient: DbClientService) => [
  initStartCommand(dbClient),
  initGetStatsCommand(dbClient),
  initAddConnectionCommand(),
];
