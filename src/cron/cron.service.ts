import cron from 'node-cron';
import { Pool } from 'pg';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository';
import { ICronService } from './cron.interface';
import { Connection } from '../modules/account/domain/entities/connection.entity';
import { Memory } from '../modules/account/domain/entities/memory.entity';


const getClient = async (connection: Connection) => {
  const pool = new Pool({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  return await pool.connect();
}

const checkLongTransaction = async (bot: Telegraf<IBotContext>, connection: Connection) => {
  const client = await getClient(connection)
  const res =
    await client.query(`SELECT pid, now() - pg_stat_activity.query_start AS duration, query, query_id state FROM pg_stat_activity 
    WHERE query_start IS NOT NULL
    AND (now() - pg_stat_activity.query_start) > interval '30 second'
    AND query NOT LIKE '%FROM pg_stat_activity%'`);

  console.log('death request:::::::::', res.rows);

  if (res.rows) {
    for (const row of res.rows) {
      try {
        bot.telegram.sendMessage(
          Number(connection.Account?.Id),
          `The transaction exceded the time limit query: ${
            row.query
          }\n${Object.entries(row.duration).reduce(
            (acc, [key, value]) => `${acc}\n${value} ${key}`,
            'Execution time:'
          )}`
        );

        client.release();
      } catch (e) {
        client.release();
        console.log(e);
      }
    }
  }
  client.release();
};

const checkUseMemory = async (bot: Telegraf<IBotContext>, connection: Connection, connectionRepo: ConnectionRepositoryImpl) => {
  const pool = new Pool({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const client = await pool.connect();
  const res = await client.query(`select pg_database_size('${connection.Database}');`)
  const currentLastStateMemory = connection?.Memories?.[(connection.Memories?.length ?? 0) - 1 ]
  console.log(`OldMembers:::::____:::::${connection?.Memories}`)
  console.log(`currentLastStateMemory - ${currentLastStateMemory} : ${res.rows[0].pg_database_size} - res.rows[0].pg_database_size`);

  if (!currentLastStateMemory) {
    connection.addMemory(new Memory(res.rows[0].pg_database_size))
  } else if (currentLastStateMemory && currentLastStateMemory !== res.rows[0].pg_database_size) {
    connection.addMemory(new Memory(res.rows[0].pg_database_size))
  } 
  try{
    await connectionRepo.save(connection)
  } catch (e) {
    console.log(e)
  }

  //connection.addMemory(new Memory(res.rows[0].pg_database_size))
  console.log("pg_database_size:::::", res.rows[0].pg_database_size)
  console.log("Model::::::::", connection.Memories)
  client.release();
}

export class CronService implements ICronService {
  constructor(
    // private readonly databaseService: IDatabase,
    private readonly bot: Telegraf<IBotContext>
  ) {}

  async init() {
      await this.asyncanalizeLongTransaction()
      await this.analizeUseMemory()
  }

  async asyncanalizeLongTransaction() {
    cron.schedule('*/13 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (let connection of connections) {
          await checkLongTransaction(this.bot, connection);
        }
      } catch (e) {
         console.log(e);
      }
    });
  }

  async analizeUseMemory() {
    cron.schedule('*/7 * * * * *', async () => {
      console.log("visit to analizeUseMemory")
      try {
        const connectionRepo = new ConnectionRepositoryImpl();
        const connections = await connectionRepo.find(true);
        try {
          for await (let connection of connections) {
            console.log("before checkUseMemory")
            await checkUseMemory(this.bot, connection, connectionRepo)
          }
        } catch (e) {
          console.log(e)
        }
  
      } catch (e) {
        console.log(e)
      }
      
    })
  }
}

