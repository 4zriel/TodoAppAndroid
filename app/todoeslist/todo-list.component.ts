import { CommonService } from './../services/common.service';
import { FirebaseService } from './../services/firebase.service';
import { Todo } from './../models/todo';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Page } from "ui/page";
import * as enums from 'ui/enums';

import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { Router } from '@angular/router';
import { ObservableArray } from "data/observable-array";
import { ListViewEventData } from "nativescript-telerik-ui/listview";
import listViewModule = require("nativescript-telerik-ui/listview");
import * as frameModule from "ui/frame";
import * as utilsModule from "utils/utils";
import * as dialogs from "ui/dialogs";
import LocalNotifications = require("nativescript-local-notifications");
import fs = require("file-system");
import * as application from "application";
import * as fileSystem from "file-system";
declare var android: any;
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
    private router: Router,
    private commonService: CommonService
  ) { }

  public notify() {
    for (let i = 0; i < this._todoes.length; i++) {
      LocalNotifications.schedule([{
        id: i,
        title: 'The title',
        body: 'The body',
        at: new Date(new Date().getTime() + (10 * 1000))
      }]).then(
        onValue => {
          console.log("ID's: " + this._todoes.getItem(i).name)
        },
        error => {
          LocalNotifications.cancelAll();
        })
    }
    LocalNotifications.getScheduledIds().then(
      ids => {
        console.log("ID's: " + ids);
      });
  }

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
      args.view.backgroundColor = "#627B64";
      args.view._subViews[0].fontSize = "40";
      args.view._subViews[1].fontSize = "20";
    }
    else {
      args.view.backgroundColor = "#818E71";
      args.view._subViews[0].fontSize = "40";
      args.view._subViews[1].fontSize = "20";
    }
  }

  public get todoes() {
    return this._todoes;
  }

  ngOnInit() {
    LocalNotifications.getScheduledIds().then(
      ids => {
        console.log("ID's: " + ids);
      });
    LocalNotifications.addOnMessageReceivedCallback(
      function (notificationData) {
        dialogs.alert({
          title: "Notification received",
          message: "ID: " + notificationData.id +
          "\nTitle: " + notificationData.title +
          "\nBody: " + notificationData.body,
          okButtonText: "Excellent!"
        });
      }
    ).then(
      onValue => console.log("should works")
      );
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
    this.todo = this._todoes.getItem(args.itemIndex);
    this.todo.index = args.data.targetIndex;
    this.firebaseService.editIndex(this.todo)
      .then((result: any) => {

      }, (error: any) => {
        this.alertHandler(error);
      });
  }

  public onCellSwiping(args: listViewModule.ListViewEventData) {
    var swipeLimits = args.data.swipeLimits;
    var currentItemView = args.object;
    var currentView;
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
  }

  public sortDate() {
    this._todoes = new ObservableArray<Todo>(this._todoes.sort(function (a, b) {
      return b.date < a.date ? 1
        : b.date > a.date ? -1
          : 0;
    }));
  }

  public sortName() {
    this._todoes = new ObservableArray<Todo>(this._todoes.sort(function (a, b) {
      return b.name < a.name ? 1
        : b.name > a.name ? -1
          : 0;
    }));
  }
  public saveToFile() {
    let todoesList = new Array<String>();
    for (let i = 0; i < this._todoes.length; i++) {
      todoesList.push((this._todoes.getItem(i).toString()));
    }
    var pathToSave;
    var androidDownloadsPath = android.os.Environment.getExternalStoragePublicDirectory(
      android.os.Environment.DIRECTORY_DOWNLOADS).toString();
    pathToSave = fileSystem.path.join(androidDownloadsPath, "NewFileToCreate.txt");
    let file = fs.File.fromPath(pathToSave);
    console.log(file);
    console.log(file.path);
    file.writeText(todoesList.toString())
      .then(result => {
        file.readText().then(res => {
          console.log("File content: " + res);
        });
      }, function (error) {
        console.log(error);
      });
  }
}

