import { File, Blob } from 'node:buffer';

(global as any).File = File;
(global as any).Blob = Blob;

import { PostgreSqlContainer } from '@testcontainers/postgresql';

export default async () => {
  const container = await new PostgreSqlContainer('postgres:15').start();

  (global as any).__TESTCONTAINER__ = container;

  process.env.TESTPGHOST = container.getHost();
  process.env.TESTPGPORT = container.getPort().toString();
  process.env.TESTPGDATABASE = container.getDatabase();
  process.env.TESTPGUSERNAME = container.getUsername();
  process.env.TESTPGPASSWORD = container.getPassword();
};

