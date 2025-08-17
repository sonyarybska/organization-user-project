import { getDataSource } from 'src/services/typeorm/typeorm.service';
import 'dotenv/config';

export default getDataSource({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  dbName: process.env.PGDATABASE,
  user: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  migrations: ['./migrations/*.ts']
});
