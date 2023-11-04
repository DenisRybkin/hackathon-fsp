import { Pool } from 'pg';

export interface ICredentialsDB {
  readonly user: string;
  readonly host: string;
  readonly database: string;
  readonly password: string;
  readonly port: number;
}

export class DbClientService {
  private pool: Pool;
  public name: string;

  constructor(credentials: ICredentialsDB) {
    this.name = credentials.database;
    this.pool = new Pool({
      user: credentials.user,
      host: credentials.host,
      database: credentials.database,
      password: credentials.password,
      port: credentials.port,
    });
  }

  static async CheckConnection(config: ICredentialsDB) {
    const pool = new Pool(config);
    const client = await pool.connect();
    const res = await client.query('select * from pg_stat_activity;');
    client.release();
    return res;
  }

  public async execute(query: string, values?: any[]): Promise<any> {
    const client = await this.pool.connect();
    const res = await client.query(query, values);
    client.release();
    return res;
  }

  public async getStatsActivity() {
    const res = await this.execute('SELECT * FROM pg_stat_activity;');
    const transformedRes = res.rows.map(item => ({
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

  public async restart() {
    //TODO:
  }

  public async getMaxBuffers() {
    const res = await this.execute('SHOW shared_buffers;');
    return res.rows[0].shared_buffers;
  }

  public async getConnections() {
    const res = await this.execute('SHOW max_connections;');
    const now = await this.execute(
      'SELECT count(*) FROM pg_stat_activity where datname=$1',
      [this.name]
    );
    return { max: res.rows[0].max_connections, now: now.rows[0].count };
  }

  public async setMaxConnections(value: number) {
    const res = await this.execute('ALTER SYSTEM SET max_connections = $1', [
      value,
    ]);
    return res;
  }

  public async setMaxBuffers(value: number) {
    const res = await this.execute('ALTER SYSTEM SET shared_buffers = $1', [
      value,
    ]);
    return res;
  }
}

