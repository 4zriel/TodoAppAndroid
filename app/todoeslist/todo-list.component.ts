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
import dialogs = require("ui/dialogs");

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
  date: Date;
  description: string;
  imagepath: string;
  UID: string;
  public todo: Todo;

  public todoes$: Observable<any>;
  public _todoes: ObservableArray<Todo> = new ObservableArray<Todo>();
  public message$: Observable<any>;
  public isSwipped = false;
  private _showOnlyDone = false;

  constructor(private routerExtensions: RouterExtensions,
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  public showOnlyDone() {
    this._showOnlyDone = !this._showOnlyDone;
    if (this._showOnlyDone) {
      let temp = new Array<Todo>();
      this._todoes.filter(a => a.done).forEach(a => temp.push(a));
      this._todoes = new ObservableArray<Todo>(temp);
    }
    else {
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
    }
  }

  public onItemLoading(args) {
    if (args.itemIndex % 2 == 0) {
      args.view.backgroundColor = "#b3ecff";
      args.view._subViews[0].fontSize = "40";
      args.view._subViews[1].fontSize = "20";
    }
    else {
      args.view.backgroundColor = "#ccf2ff";
      args.view._subViews[0].fontSize = "40";
      args.view._subViews[1].fontSize = "20";
    }
  }

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
    var options = {
      title: "Add new todo",
      defaultText: "What You want to do?",
      inputType: dialogs.inputType.text,
      okButtonText: "Add",
      cancelButtonText: "Cancel",
    };
    dialogs.prompt(options).then((result: dialogs.PromptResult) => {
      if (result.result) {
        let todoDB: string = result.text;
        this.firebaseService.add(todoDB).then((message: any) => {
          this.name = "";
          this.confirmHandler(message);
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
        })
      }
    });
  }

  alertHandler(msg: any) {
    let options = {
      title: 'Error',
      message: `${msg}`,
      okButtonText: "OK"
    };
    return dialogs.alert(options).then(() => {
      console.log(`error: ${msg}`);
    });
  }


  confirmHandler(msg: any) {
    let options = {
      title: 'Info',
      message: `${msg}`,
      okButtonText: "OK"
    };
    return dialogs.confirm(options).then(() => {
      console.log(`info: ${msg}`);
    });
  }


  delete(totoItem: Todo) {
    this.firebaseService.delete(totoItem)
      .catch(() => {
        this.alertHandler("An error occurred while deleting an item from your list.");
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
    this.isSwipped = false;
    this.todo = this._todoes.getItem(args.itemIndex);
    console.log(this.todo.name);
  }

  public onSwipeCellStarted(args: listViewModule.ListViewEventData) {
    this.isSwipped = true;
    var swipeLimits = args.data.swipeLimits;
    var listView = frameModule.topmost().currentPage.getViewById("listView");
    swipeLimits.threshold = 60 * utilsModule.layout.getDisplayDensity();
    swipeLimits.left = 80 * utilsModule.layout.getDisplayDensity();
    swipeLimits.right = 80 * utilsModule.layout.getDisplayDensity();
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

  public onRightSwipeClick(args) {
    var listView = <listViewModule.RadListView>frameModule.topmost().currentPage.getViewById("listView");
    let todoToRemove = this._todoes.indexOf(this.todo);
    this._todoes.splice(todoToRemove, 1);
    this.delete(this.todo);
    //this._todoes = new ObservableArray<Todo>(temp);
    // this.firebaseService.editDone(this.todo)
    //   .then(
    //   onValue => listView.notifySwipeToExecuteFinished(),
    //   onError => listView.notifySwipeToExecuteFinished()
    //   );
  }
}

