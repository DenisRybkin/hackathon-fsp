import { Pool } from 'pg';

export interface ICredentialsDB {
  readonly user: string;
  readonly host: string;
  readonly database: string;
  readonly password: string;
  readonly port: number;
}

export class DbClientService {
  //   private pool: Pool;
  public name: string;

  constructor(credentials: ICredentialsDB) {
    this.name = credentials.database;
    // this.pool = new Pool({
    //   user: credentials.user,
    //   host: credentials.host,
    //   database: credentials.database,
    //   password: credentials.password,
    //   port: credentials.port,
    // });
  }

  public async execute(command: string): Promise<any> {
    // const client = await this.pool.connect();
    // const res = await client.query(command);
    // client.release();
    // return res;
  }

  public async getStatsActivity() {
    const res = await this.execute('SELECT * FROM pg_stat_activity;');
    const transformedRes = res.rows
      .filter(item => item.datname == 'r-journal1')
      .map(item => ({
        datid: item.datid,
        datname: item.datname,
        pid: item.pid,
        usename: item.usename,
        application_name: item.application_name,
        query_start: item.query_start,
        state_change: item.state_change,
        state: item.state,
      }));
    return transformedRes;
  }
}

