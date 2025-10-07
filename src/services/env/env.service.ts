import 'dotenv/config';
import { EnvironmentSchema } from 'src/types/Environment';

EnvironmentSchema.parse(process.env);