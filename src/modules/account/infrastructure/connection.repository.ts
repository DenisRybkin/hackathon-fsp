import { UUID } from 'crypto';
import prisma from '../../../libs/prisma';
import { IConnectionRepository } from '../domain/connection.repository';
import { Connection } from '../domain/entities/connection.entity';
import { Account } from '../domain/entities/account.entity';

export class ConnectionRepositoryImpl implements IConnectionRepository {
  public async find(): Promise<Connection[]> {
    return prisma.connection
      .findMany({ include: { account: true } })
      .then(connections =>
        connections.map(
          ({ id, active, port, user, host, database, password, account }) =>
            new Connection(
              port,
              user,
              host,
              database,
              password,
              id as UUID,
              active,
              new Account(
                account.id,
                account.username,
                account.firstname,
                account.lastname,
                []
              )
            )
        )
      );
  }
}

