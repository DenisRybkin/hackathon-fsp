import cron from 'node-cron'
import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { Memory } from '../modules/account/domain/entities/memory.entity'
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository'
import { ICronService } from './cron.interface'
import { GetDeadlocks, SendDeadlockMessage } from './utils/deadlock.utils'
import {
  GetTransactions,
  SendLongTransactionMessage,
  TerminateHandler,
} from './utils/long-transactions.utils'
import { GetMemoryDatabase, SendFullDatebaseMessage } from './utils/memory.utils'

const checkLongTransaction = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
  const transactions = await GetTransactions(connection);

  console.log('transactions:', transactions);
  if(!transactions) return null;
  for (const transaction of transactions) {
    await SendLongTransactionMessage(bot, connection, transaction);
  }

  TerminateHandler(bot, connection);
};

const checkDeadlocks = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
const deadlocks = await GetDeadlocks(connection);

if (!deadlocks) return

console.log('deadlocks:', deadlocks);

for (const deadlock of deadlocks) {
  await SendDeadlockMessage(bot, connection, deadlock)
}
}

const checkMemoryDatabase = async (
  connection: Connection,
  connectionRepo: ConnectionRepositoryImpl
) => {
  const memory = await GetMemoryDatabase(connection);
  connection.addMemory(new Memory(memory[0].pg_database_size))
  
  try{
    await connectionRepo.save(connection)
  } catch (e) {
    console.log(e)
  }
  console.log("size::::::::", memory[0].pg_database_size)
}

const checkFullMemoryDatebaseConnection = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
    const memory = await GetMemoryDatabase(connection);
    const currentLastStateMemory = connection?.Memories?.[1]
    const firstStateMemory = connection?.Memories?.[(connection.Memories?.length) - 1]
    //console.log("firstStateMemory", firstStateMemory, '---', currentLastStateMemory, "currentLastStateMemory")
    if (firstStateMemory && currentLastStateMemory) {
      const difference = ((+firstStateMemory.Usage * 100) / +currentLastStateMemory.Usage) - 100
      // console.log("firstStateMemory", firstStateMemory, "currentLastStateMemory", currentLastStateMemory)
      // console.log("difference", difference)
      console.log(difference, currentLastStateMemory.Usage, firstStateMemory.Usage)
      if (difference > 20) {
        await SendFullDatebaseMessage(bot, connection)
      }
    } 
}

export class CronService implements ICronService {
  constructor(private readonly bot: Telegraf<IBotContext>) {}

  async init() {
    await this.asyncAnalyzeLongTransaction();
    await this.asyncAnalyzeDeadlocks();
    await this.analizeUseMemory();
    await this.checkFullMemoryDatabase();
  }

  async asyncAnalyzeLongTransaction() {
    cron.schedule('*/30 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      if(!connections) return null;

      try {
        for (const connection of connections) {
          await checkLongTransaction(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }
  async analizeUseMemory() {
    cron.schedule('*/1 * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      if(!connections) return null;
      try {
        for (const connection of connections) {
          await checkMemoryDatabase(connection, connectionRepo)
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }
  async asyncAnalyzeDeadlocks() {
    cron.schedule('*/8 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      
      if(!connections) return null;

      try {
        for (const connection of connections) {
          await checkDeadlocks(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    })
  }
  async checkFullMemoryDatabase() {
    cron.schedule('*/50 * * * * *', async() => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      if(!connections) return null;
      try {
        for (const connection of connections) {
          await checkFullMemoryDatebaseConnection(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    })
  }
}

