import { UUID, randomUUID } from 'crypto';
import { Account } from './account.entity';

export class Connection {
  private readonly id: UUID;
  private readonly active: boolean;

  constructor(
    private port: number,
    private user: string,
    private host: string,
    private database: string,
    private password: string,
    id?: UUID,
    active?: boolean,
    private readonly account?: Account
  ) {
    this.id = id ?? randomUUID();
    this.active = active ?? true;
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
  public get Account(): Account | undefined {
    return this.account;
  }
}

