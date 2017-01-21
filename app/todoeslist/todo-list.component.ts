import { FirebaseService } from './../services/firebase.service';
import { Todo } from './../models/todo';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Page } from "ui/page";

import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { Router } from '@angular/router';
import { ObservableArray } from "data/observable-array";
import { ListViewEventData } from "nativescript-telerik-ui/listview";
import listViewModule = require("nativescript-telerik-ui/listview");
import * as frameModule from "ui/frame";
import * as utilsModule from "utils/utils";

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
  public _todoes: ObservableArray<Todo> = new ObservableArray<Todo>();
  public message$: Observable<any>;

  constructor(private routerExtensions: RouterExtensions,
    private firebaseService: FirebaseService,
    private router: Router
  ) { }


  public get todoes() {
    return this._todoes;
  }

  onPullToRefreshInitiated($event) {
  }

  ngOnInit() {
    this.todoes$ = <any>this.firebaseService.getTodoList();
    let subscribe = this.todoes$.subscribe(
      onValue => {
        this._todoes = new ObservableArray<Todo>();
        onValue.forEach(
          a => this._todoes.push(a));
        subscribe.unsubscribe();
      },
      onError => {
        this._todoes = new ObservableArray<Todo>();
        subscribe.unsubscribe();
      }
    );
    // this.todoes$.forEach(
    //   a => this._todoes.push(a));
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

  public onItemReordered(args: ListViewEventData) {
    console.log("Item reordered. Old index: " + args.itemIndex + " " + "new index: " + args.data.targetIndex);
  }

  public onCellSwiping(args: listViewModule.ListViewEventData) {
    var swipeLimits = args.data.swipeLimits;
    var currentItemView = args.object;
    var currentView;

    if (args.data.x > 200) {
      console.log("Notify perform left action");
    } else if (args.data.x < -200) {
      console.log("Notify perform right action");
    }
  }

  public onSwipeCellFinished(args: listViewModule.ListViewEventData) {
    this.todo = this._todoes.getItem(args.itemIndex);
    console.log(this.todo.name);
  }

  public onSwipeCellStarted(args: listViewModule.ListViewEventData) {
    var swipeLimits = args.data.swipeLimits;
    var listView = frameModule.topmost().currentPage.getViewById("listView");

    swipeLimits.threshold = 80 * utilsModule.layout.getDisplayDensity();
    swipeLimits.left = 120 * utilsModule.layout.getDisplayDensity();
    swipeLimits.right = 120 * utilsModule.layout.getDisplayDensity();
  }

  public onItemClick(args: listViewModule.ListViewEventData) {
    var listView = <listViewModule.RadListView>frameModule.topmost().currentPage.getViewById("listView");
    listView.notifySwipeToExecuteFinished();
    this.todo = this._todoes.getItem(args.itemIndex);
    this.router.navigate(["/todo", this.todo.id]);
  }

  public onLeftSwipeClick(args) {
    var listView = <listViewModule.RadListView>frameModule.topmost().currentPage.getViewById("listView");
    this.todo.done = !this.todo.done;
    this.firebaseService.editDone(this.todo)
      .then(
      onValue => listView.notifySwipeToExecuteFinished(),
      onError => listView.notifySwipeToExecuteFinished()
      );
  }
}

