export class Todo {
  public id: string = "";
  public name: string = "";
  public date: string = "";
  public description: string = "";
  public imagepath: string = "";
  public UID: string = "";
  public index: number;
  public done: boolean;
  constructor(
    id?: string,
    name?: string,
    date?: string,
    description?: string,
    imagepath?: string,
    UID?: string,
    index?: number,
    done?: boolean
  ) {

  }
}