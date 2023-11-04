import { UUID, randomUUID } from 'crypto';
import { Account } from './account.entity';
import { Nullable } from '../../../../types/app.types';

export class Connection {
  private readonly id: UUID;
  private readonly active: boolean;
  private readonly dashboard: Nullable<string>;

  constructor(
    private port: number,
    private user: string,
    private host: string,
    private database: string,
    private password: string,
    id?: UUID,
    active?: boolean,
    dashboard?: Nullable<string>,
    private readonly account?: Account
  ) {
    this.id = id ?? randomUUID();
    this.active = active ?? true;
    this.dashboard = dashboard ?? null;
  }

  public get Id(): UUID {
    return this.id;
  }
  public get Port(): number {
    return this.port;
  }
  public get User(): string {
    return this.user;
  }
  public get Host(): string {
    return this.host;
  }
  public get Database(): string {
    return this.database;
  }
  public get Password(): string {
    return this.password;
  }
  public get Active(): boolean {
    return this.active;
  }
  public get Dashboard(): Nullable<string> {
    return this.dashboard;
  }
  public get Account(): Account | undefined {
    return this.account;
  }
}

