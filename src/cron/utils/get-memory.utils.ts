import { Connection } from '../../modules/account/domain/entities/connection.entity';
import { DbClientService } from '../../database/db-client.service';

export const GetMemoryDatabase = async (connection: Connection) => {
  const cl = new DbClientService({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const transactions = await cl.getMemory(connection.Database);
  return transactions;
};


