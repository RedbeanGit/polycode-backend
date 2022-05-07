export interface IMailerConfigAttributes {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface IMailerConfig {
  development: IMailerConfigAttributes;
  test: IMailerConfigAttributes;
  production: IMailerConfigAttributes;
}
