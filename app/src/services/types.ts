export interface ServiceOptions {
  schedule: string | undefined;
  service: string;
  leading?: boolean;
  type?: string;
  proxy?: {
    host: string;
    port: number;
    protocol?: string;
  };
}

export interface ServiceState<T = {}> extends Readonly<ServiceOptions> {
  state: T;
}
