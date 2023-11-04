import cron from 'node-cron'
import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository'
import { ICronService } from './cron.interface'
import { GetDeadlocks, SendDeadlockMessage } from './utils/deadlock.utils'
import {
  GetTransactions,
  SendLongTransactionMessage,
  TerminateHandler,
} from './utils/long-transactions.utils'

const checkLongTransaction = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
  const transactions = await GetTransactions(connection);

  console.log('transactions:', transactions);

  for await (const transaction of transactions) {
    SendLongTransactionMessage(bot, connection, transaction);
  }

  TerminateHandler(bot, connection);
};

const checkDeadlocks = async (
    bot: Telegraf<IBotContext>,
    connection: Connection
) => {
  const deadlocks = await GetDeadlocks(connection);

  console.log('deadlocks:', deadlocks);

  for await (const deadlock of deadlocks) {
    SendDeadlockMessage(bot, connection, deadlock)
  }
}

export class CronService implements ICronService {
  constructor(private readonly bot: Telegraf<IBotContext>) {}

  async init() {
    await this.asyncAnalyzeLongTransaction();
    await this.asyncAnalyzeDeadlocks();
    // await this.analizeUseMemory();
  }

  async asyncAnalyzeLongTransaction() {
    cron.schedule('*/13 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (const connection of connections) {
          checkLongTransaction(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }

  async asyncAnalyzeDeadlocks() {
    cron.schedule('*/20 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (const connection of connections) {
          checkDeadlocks(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    })
  }
}

