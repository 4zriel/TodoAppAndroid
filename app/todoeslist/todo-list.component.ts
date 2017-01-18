import { FirebaseService } from './../services/firebase.service';
import { Todo } from './../models/todo';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Page } from "ui/page";

import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { Router } from '@angular/router';
import { ObservableArray } from "data/observable-array";

@Component({
  moduleId: module.id,
  selector: "todo-list",
  templateUrl: "todo-list.html",
  styleUrls: ["todo-list.css"]
})
export class TodoListComponent implements OnInit {

  private isLoading = false;
  id: string;
  name: string;
  date: string;
  description: string;
  imagepath: string;
  UID: string;
  public todo: Todo;

  public todoes$: Observable<any>;
  public _todoes: ObservableArray<any> = new ObservableArray<any>();
  public message$: Observable<any>;

  constructor(private routerExtensions: RouterExtensions,
    private firebaseService: FirebaseService,
    private router: Router
  ) { }


  public get todoes() {
    return this._todoes;
  }

  onPullToRefreshInitiated($event) {
    this._todoes = new ObservableArray<any>([
      { "id": 1, "name": "Item 1", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 2, "name": "Item 2", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 3, "name": "Item 3", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 4, "name": "Item 4", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 5, "name": "Item 5", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 6, "name": "Item 6", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 7, "name": "Item 7", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 8, "name": "Item 8", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 9, "name": "Item 9", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 10, "name": "Item 10", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
    ]);
  }

  ngOnInit() {
    this.todoes$ = <any>this.firebaseService.getTodoList();
    this._todoes = new ObservableArray<any>([
      { "id": 1, "name": "Item 1", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 2, "name": "Item 2", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 3, "name": "Item 3", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 4, "name": "Item 4", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 5, "name": "Item 5", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 6, "name": "Item 6", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 7, "name": "Item 7", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 8, "name": "Item 8", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 9, "name": "Item 9", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
      { "id": 10, "name": "Item 10", "description": "This is item description.", "title": "This is item Title", "text": "This is item Text", "image": "This is item Image", "selected": false },
    ]);
    this.message$ = <any>this.firebaseService.getRemote();
  }

  add() {
    this.todo = new Todo(
      this.id,
      this.name,
      this.date,
      this.description,
      this.imagepath,
      this.UID)

    let todoDB: string = this.todo.name;

    this.firebaseService.add(todoDB).then((message: any) => {
      this.name = "";
      alert(message);
    })

  }

  delete(totoItem: Todo) {
    this.firebaseService.delete(totoItem)
      .catch(() => {
        alert("An error occurred while deleting an item from your list.");
      });
  }

  viewDetail(id: string) {
    this.router.navigate(["/todo", id]);
  }

  logout() {
    this.firebaseService.logout();
    this.routerExtensions.navigate(["/login"], { clearHistory: true });
  }
}

