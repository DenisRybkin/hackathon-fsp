import { Connection } from '../../modules/account/domain/entities/connection.entity';
import { DbClientService } from '../../database/db-client.service';
import { Telegraf } from 'telegraf'
import { IBotContext } from '../../context/context.interface'

export const GetMemoryDatabase = async (connection: Connection) => {
  const cl = new DbClientService({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const transactions = await cl.getMemory(connection.Database);
  return transactions;
};


export const SendFullDatebaseMessage = (
  bot: Telegraf<IBotContext>,
  connection: Connection,
) => {
  const message = `the total disk space occupied by the database has been increased by 80%+`;

  return bot.telegram.sendMessage(Number(connection.Account?.Id), message);
};


