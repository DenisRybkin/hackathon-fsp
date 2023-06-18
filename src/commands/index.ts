import { CommandBase } from './base/command.base';
import { initStartCommand } from './start.command';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { CryptomusService } from '../cryptomus/cryptomus.service';
import { DatabaseService } from '../database/database.service';

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export const initializersCommands: (
  cryptomusService: CryptomusService,
  databaseSrvice: DatabaseService
) => Array<InitCommandType> = (cryptomusService, databaseSrvice) => [
  initStartCommand(cryptomusService, databaseSrvice),
];
