import * as dotenv from 'dotenv';
import { IDockerConfig } from './interfaces/dockerConfig.interface';

dotenv.config();

export const dockerConfig: IDockerConfig = {
  development: {
    socketPath: process.env.DOCKER_SOCKET_PATH,
  },
  test: {
    protocol: process.env.DOCKER_PROTOCOL,
    host: process.env.DOCKER_HOST,
    port: Number(process.env.DOCKER_PORT),
    ca: process.env.DOCKER_TLS_CA,
    cert: process.env.DOCKER_TLS_CERT,
    key: process.env.DOCKER_TLS_KEY,
  },
  production: {
    protocol: process.env.PROTOCOL,
    host: process.env.DOCKER_HOST,
    port: Number(process.env.DOCKER_PORT),
    ca: process.env.DOCKER_TLS_CA,
    cert: process.env.DOCKER_TLS_CERT,
    key: process.env.DOCKER_TLS_KEY,
  },
};
