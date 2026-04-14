import { Logger } from '@nestjs/common';
import { Connection, Mongoose, connection as defaultConnection } from 'mongoose';
import mongoose from 'mongoose';
import { sanitizeForLog, toLogMessage } from './logging.utils';

const queryLogger = new Logger('MongoQuery');
const connectionLogger = new Logger('MongoConnection');

let debugConfigured = false;

export function configureMongooseLogging(instance: Mongoose = mongoose): void {
  if (debugConfigured) {
    return;
  }

  instance.set(
    'debug',
    (
      collectionName: string,
      method: string,
      query: unknown,
      doc?: unknown,
      options?: unknown,
    ) => {
      queryLogger.log(
        toLogMessage('mongo.query', {
          collection: collectionName,
          method,
          query: sanitizeForLog(query),
          doc: sanitizeForLog(doc),
          options: sanitizeForLog(options),
        }),
      );
    },
  );

  debugConfigured = true;
}

export function attachMongooseConnectionLogging(
  connection: Connection = defaultConnection,
): Connection {
  connection.on('connected', () => {
    connectionLogger.log(
      toLogMessage('mongo.connected', {
        host: connection.host,
        name: connection.name,
      }),
    );
  });

  connection.on('disconnected', () => {
    connectionLogger.warn(
      toLogMessage('mongo.disconnected', {
        host: connection.host,
        name: connection.name,
      }),
    );
  });

  connection.on('reconnected', () => {
    connectionLogger.log(
      toLogMessage('mongo.reconnected', {
        host: connection.host,
        name: connection.name,
      }),
    );
  });

  connection.on('error', (error: Error) => {
    connectionLogger.error(
      toLogMessage('mongo.error', {
        error: sanitizeForLog(error),
        host: connection.host,
        name: connection.name,
      }),
    );
  });

  return connection;
}
