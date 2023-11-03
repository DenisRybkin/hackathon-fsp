import { Nullable } from '../../../../types/app.types';
import { Connection } from './connection.entity';

export class Account {
  constructor(
    private readonly id: bigint,
    private username: Nullable<string>,
    private firstname: Nullable<string>,
    private lastname: Nullable<string>,
    private readonly connections: Connection[]
  ) {}

  public get Id(): bigint {
    return this.id;
  }
  public get Username(): Nullable<string> {
    return this.username;
  }
  public get Firstname(): Nullable<string> {
    return this.firstname;
  }
  public get Lastname(): Nullable<string> {
    return this.lastname;
  }
  public get Connections(): Connection[] {
    return this.connections;
  }

  public addConnection(connection: Connection): void {
    this.connections.push(connection);
  }
}

