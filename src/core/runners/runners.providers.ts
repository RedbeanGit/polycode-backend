import * as Docker from 'dockerode';
import { DEVELOPMENT, DOCKER, PRODUCTION, TEST } from '../constants';
import {
  IHttpDockerConfig,
  ISocketDockerConfig,
} from './interfaces/dockerConfig.interface';
import { dockerConfig } from './runners.config';

export const runnersProviders = [
  {
    provide: DOCKER,
    useFactory: (): Docker => {
      let config: ISocketDockerConfig | IHttpDockerConfig;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = dockerConfig.development;
          break;
        case TEST:
          config = dockerConfig.test;
          break;
        case PRODUCTION:
          config = dockerConfig.production;
          break;
        default:
          config = dockerConfig.development;
      }
      return new Docker(config);
    },
  },
];
