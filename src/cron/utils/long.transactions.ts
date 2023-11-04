import { Telegraf } from 'telegraf';
import { DbClientService } from '../../database/db-client.service';
import { Connection } from '../../modules/account/domain/entities/connection.entity';
import { IBotContext } from '../../context/context.interface';

export const GetTransactions = async (connection: Connection) => {
  const cl = new DbClientService({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const transactions = await cl.longTransactions();
  return transactions;
};

export const SendMessage = (
  bot: Telegraf<IBotContext>,
  connection: Connection,
  transaction: { query: string; pid: number; duration: { [key: string]: any } }
) => {
  const message = `The transaction exceded the time limit query: ${
    transaction.query
  }\n${Object.entries(transaction.duration).reduce(
    (acc, [key, value]) => `${acc}\n${value} ${key}`,
    'Execution time:'
  )}`;

  const keyboard = [
    [
      {
        text: 'Undo',
        callback_data: `kill-transaction-${transaction.pid}`,
      },
    ],
  ];

  return bot.telegram.sendMessage(Number(connection.Account?.Id), message, {
    reply_markup: { inline_keyboard: keyboard },
  });
};

export const TerminateHanlder = (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
  bot.action(/^kill-transaction-(\d+)$/, async ctx => {
    await new DbClientService({
      user: connection.User,
      host: connection.Host,
      database: connection.Database,
      password: connection.Password,
      port: connection.Port,
    }).execute('select pg_terminate_backend($1)', [Number(ctx.match[1])]);
  });
};

