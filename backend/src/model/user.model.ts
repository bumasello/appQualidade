export class User {
  public username: string;
  public pass: string;
  constructor(username: string, pass: string) {
    ((this.username = username), (this.pass = pass));
  }
}
