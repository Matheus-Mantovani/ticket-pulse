export interface IURL {
  domain?: string;
  ip?: string;
  port?: string;
  protocol?: string;
  endpoint?: string;
  query?: string;
}

export default class WebUrl {
  private _urlObject?: URL;
  private domain?: string;
  private ip?: string;
  private port?: string;
  private protocol?: string;
  private endpoint?: string;
  private query?: string;

  constructor(url: IURL) {
    this.protocol = url.protocol || "http";
    this.domain = url.domain;
    this.ip = url.ip;
    this.port = url.port;
    this.endpoint = url.endpoint;
    this.query = url.query;
  }

  toString(): string {
    const host = this.domain || this.ip || "localhost";
    const portStr = this.port ? `:${this.port}` : "";
    const pathStr = this.endpoint ? (this.endpoint.startsWith("/") ? this.endpoint : `/${this.endpoint}`) : "";
    const queryStr = this.query ? (this.query.startsWith("?") ? this.query : `?${this.query}`) : "";
    return `${this.protocol}://${host}${portStr}${pathStr}${queryStr}`;
  }

  toURL(): URL {
    if (!this._urlObject) {
      this._urlObject = new URL(this.toString());
    }
    return this._urlObject;
  }
}
