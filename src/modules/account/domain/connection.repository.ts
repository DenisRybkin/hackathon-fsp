import { Connection } from './entities/connection.entity';

export abstract class IConnectionRepository {
  public abstract find(): Promise<Connection[]>;
}

