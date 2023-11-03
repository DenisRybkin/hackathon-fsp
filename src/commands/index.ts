import { CommandBase } from './base/command.base';
import { initStartCommand } from './start.command';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export const initializersCommands: (
    /* TODO: mb add prisma client for store credentials of db instances*/
) => Array<InitCommandType> = () => [
  initStartCommand(),
];
