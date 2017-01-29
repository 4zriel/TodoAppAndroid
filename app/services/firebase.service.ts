import { User } from './../models/user';
import { Todo } from './../models/todo';
import { Injectable, NgZone } from "@angular/core";
import { TokenService } from "./token.service";
import firebase = require("nativescript-plugin-firebase");
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CommonService } from './common.service';
import 'rxjs/add/operator/share';
import * as dialogs from "ui/dialogs";

@Injectable()
export class FirebaseService {
  constructor(
    private ngZone: NgZone,
    private commons: CommonService
  ) {

  }

  items: BehaviorSubject<Array<Todo>> = new BehaviorSubject([]);

  private _allItems: Array<Todo> = [];

  register(user: User) {
    return firebase.createUser({
      email: user.email,
      password: user.password
    }).then((result: any) => {
      firebase.sendEmailVerification();
      this.confirmHandler('Please cheack Your email to verified your account');
      return JSON.stringify(result);
    }, errorMessage => {
      this.alertHandler(errorMessage);
    })
  }

  login(user: User) {
    return firebase.login({
      type: firebase.LoginType.PASSWORD,
      email: user.email,
      password: user.password
    }).then((result: any) => {
      if (result.emailVerified) {
        TokenService.token = result.uid;
        return JSON.stringify(result);
      }
      else {
        firebase.sendEmailVerification();
        this.logout();
        return this.alertHandler('Please cheack Your email to verified your account');
      }
    }, errorMessage => {
      this.alertHandler(errorMessage);
    })
  }

  logout() {
    TokenService.token = "";
    firebase.logout();
  }

  resetPassword(email) {
    return firebase.resetPassword({
      email: email
    }).then((result: any) => {
      this.confirmHandler(result);
    }, errorMessage => {
      this.alertHandler(errorMessage);
    }).catch(this.handleErrors);
  }

  getTodoList(): Observable<Todo> {
    return new Observable((observer: any) => {
      let path = 'Todos';
      let onValueEvent = (snapshot: any) => {
        this.ngZone.run(() => {
          let results = this.handleSnapshot(snapshot.value);
          console.log(JSON.stringify(results))
          observer.next(results);
        });
      };
      firebase.addValueEventListener(onValueEvent, `/${path}`);
    }).share();
  }

  getMyTodo(id: string): Todo {
    return this._allItems.filter(s => s.id === id)[0];
  }

  getRemote(): Observable<any> {
    return new Observable((observer: any) => {
      firebase.getRemoteConfig({
        developerMode: true,
        cacheExpirationSeconds: 30,
        properties: [{
          key: "message",
          default: "Hello"
        }]
      }).then(
        function (result) {
          console.log("Fetched at " + result.lastFetch + (result.throttled ? " (throttled)" : ""));
          for (let entry in result.properties) {
            observer.next(result.properties[entry]);
          }
        });
    }).share();
  }

  handleSnapshot(data: any) {
    this._allItems = [];
    if (data) {
      for (let id in data) {
        let result = (<any>Object).assign({ id: id }, data[id]);
        if (TokenService.token === result.UID) {
          this._allItems.push(result);
        }
      }
      this.publishUpdates();
    }
    return this._allItems;
  }

  publishUpdates() {
    this._allItems.sort(function (a, b) {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
    this.items.next([...this._allItems]);
  }

  add(Todo: string) {
    return firebase.push(
      "/Todos",
      { "name": Todo, "UID": TokenService.token, "date": 0 - Date.now(), "imagepath": "" }
    ).then(
      (result: any) => {
        return 'Todo added to your todo-list!';
      },
      function (errorMessage: any) {
        console.log(errorMessage);
      });
  }

  editTodo(item: Todo) {
    this.publishUpdates();
    return firebase.update(`/Todos/${item.id}`,
      {
        "name": item.name,
        "description": item.description,
        "date": item.date.toJSON(),
        "imagepath": item.imagepath
      }
    )
      .then(
      (result: any) => {
        return 'You have successfully edited this todo!';
      }, errorMessage => {
        this.alertHandler(errorMessage);
      })
  }

  editDone(item: Todo) {
    this.publishUpdates();
    return firebase.update(`/Todos/${item.id}`,
      {
        "done": item.done
      }
    )
      .then(
      (result: any) => {
        return 'You have successfully edited this todo!';
      }, errorMessage => {
        this.alertHandler(errorMessage);
      })
  }

  editIndex(item: Todo) {
    this.publishUpdates();
    return firebase.update(`/Todos/${item.id}`,
      {
        "index": item.index
      }
    )
      .then(
      (result: any) => {
        return 'You have successfully edited this todo!';
      }, errorMessage => {
        this.alertHandler(errorMessage);
      })
  }



  delete(Todo: Todo) {
    return firebase.remove("/Todos/" + Todo.id + "")
      .catch(this.handleErrors);
  }

  uploadFile(localPath: string, file?: any): Promise<any> {
    let filename = this.commons.getFilename(localPath);
    let remotePath = `${filename}`;
    return firebase.uploadFile({
      remoteFullPath: remotePath,
      localFullPath: localPath,
      onProgress: function (status) {
        console.log("Uploaded fraction: " + status.fractionCompleted);
        console.log("Percentage complete: " + status.percentageCompleted);
      }
    });
  }

  getDownloadUrl(remoteFilePath: string): Promise<any> {
    return firebase.getDownloadUrl({
      remoteFullPath: remoteFilePath
    })
      .then(
      function (url: string) {
        return url;
      }, errorMessage => {
        this.alertHandler(errorMessage);
      })
  }

  handleErrors(error) {
    console.log(JSON.stringify(error));
    return Promise.reject(error.message);
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
}