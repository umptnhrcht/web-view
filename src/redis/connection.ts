import { createClient, RedisClientType } from 'redis';

export interface RedisConnectionParams {
  host: string;
  port: number;
  user?: string;
  password?: string;
}

export async function connectToRedis(params: RedisConnectionParams): Promise<RedisClientType> {
  const url = `redis://${params.user ? params.user + ':' : ''}${params.password ? params.password + '@' : ''}${params.host}:${params.port}`;
  const client = createClient({ url });
  await client.connect();
  return client;
}
