import cron from 'node-cron';
import { Pool } from 'pg';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository';
import { ICronService } from './cron.interface';
import { Connection } from '../modules/account/domain/entities/connection.entity';

const check = async (bot: Telegraf<IBotContext>, connection: Connection) => {
  const pool = new Pool({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const client = await pool.connect();
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
};

export class CronService implements ICronService {
  constructor(
    // private readonly databaseService: IDatabase,
    private readonly bot: Telegraf<IBotContext>
  ) {}

  async init() {
    cron.schedule('*/10 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (let connection of connections) {
          await check(this.bot, connection);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}

