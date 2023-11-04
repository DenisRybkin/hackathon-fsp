import cron from 'node-cron'
import { Pool } from 'pg'
import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository'
import { ICronService } from './cron.interface'

export class CronService implements ICronService {
  constructor(
    // private readonly databaseService: IDatabase,
    private readonly bot: Telegraf<IBotContext>,
  ) { }
  
  
  async init() {
    cron.schedule('*/5 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
        const connestions = await connectionRepo.find();
        
        try {
          const pool = new Pool({
            user: connestions[0].User,
            host: connestions[0].Host,
            database: connestions[0].Database,
            password: connestions[0].Password,
            port: connestions[0].Port,
          })
          const client = await pool.connect();
          const res = await client.query(`SELECT  pid, now() - pg_stat_activity.query_start AS duration, query, state FROM (SELECT * FROM pg_stat_activity WHERE query_start IS NOT NULL) pg_stat_activity 
          WHERE (now() - pg_stat_activity.query_start) > interval '8 second'`)
          console.log("death request:::::::::", res.rows)
          if (res.rows){
            for (const row of res.rows) {
              try {
                await client.query(`SELECT pg_cancel_backend(${row.pid})`)
                //await client.query(`SELECT pg_terminate_backend(${row.pid})`)
                this.bot.telegram.sendMessage(Number(connestions[0].Account?.Id), `The transaction exceeded the time limit: query: ${res.rows[0].query}`)
              } catch (e) {
               console.log(e)  
              }
            }
          }
      }
        catch(e) {
          console.log(e)
        }
        
    });
  }
}
