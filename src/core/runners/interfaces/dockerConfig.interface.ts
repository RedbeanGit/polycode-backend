export interface IHttpDockerConfig {
  protocol: string;
  host: string;
  port: number;
  ca?: string;
  cert?: string;
  key?: string;
}

export interface ISocketDockerConfig {
  socketPath: string;
}

export interface IDockerConfig {
  development: ISocketDockerConfig;
  test: IHttpDockerConfig;
  production: IHttpDockerConfig;
}
