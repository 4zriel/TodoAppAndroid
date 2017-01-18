import { User } from './../models/user';
import { Todo } from './../models/todo';
import { Injectable, NgZone } from "@angular/core";
import { TokenService } from "./token.service";
import firebase = require("nativescript-plugin-firebase");
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CommonService } from './common.service';
import 'rxjs/add/operator/share';

@Injectable()
export class FirebaseService {
  constructor(
    private ngZone: NgZone,
    private commons: CommonService
  ) { }

  items: BehaviorSubject<Array<Todo>> = new BehaviorSubject([]);

  private _allItems: Array<Todo> = [];

  register(user: User) {
    return firebase.createUser({
      email: user.email,
      password: user.password
    }).then(
      function (result: any) {
        return JSON.stringify(result);
      },
      function (errorMessage: any) {
        alert(errorMessage);
      }
      )
  }

  login(user: User) {
    return firebase.login({
      type: firebase.LoginType.PASSWORD,
      email: user.email,
      password: user.password
    }).then((result: any) => {
      TokenService.token = result.uid;
      return JSON.stringify(result);
    }, (errorMessage: any) => {
      this.alertHandler(errorMessage);
    });
  }

  logout() {
    TokenService.token = "";
    firebase.logout();
  }

  resetPassword(email) {
    return firebase.resetPassword({
      email: email
    }).then((result: any) => {
      this.alertHandler(result);
    },
      function (errorMessage: any) {
        this.alertHandler(errorMessage);
      }
      ).catch(this.handleErrors);
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

  getMyTodo(id: string): Observable<any> {
    return new Observable((observer: any) => {
      observer.next(this._allItems.filter(s => s.id === id)[0]);
    }).share();
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
        }
        );
    }).share();
  }

  handleSnapshot(data: any) {
    //empty array, then refill and filter
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
    // here, we sort must emit a *new* value (immutability!)
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
      function (result: any) {
        return 'Todo added to your todo-list!';
      },
      function (errorMessage: any) {
        console.log(errorMessage);
      });
  }

  editTodo(id: string, description: string, imagepath: string) {
    this.publishUpdates();
    return firebase.update("/Todos/" + id + "", {
      description: description,
      imagepath: imagepath
    })
      .then(
      function (result: any) {
        return 'You have successfully edited this todo!';
      },
      function (errorMessage: any) {
        console.log(errorMessage);
      });
  }

  editDescription(id: string, description: string) {
    this.publishUpdates();
    return firebase.update("/Todos/" + id + "", {
      description: description
    })
      .then(
      function (result: any) {
        return 'You have successfully edited the description!';
      },
      function (errorMessage: any) {
        console.log(errorMessage);
      });
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
      },
      function (errorMessage: any) {
        console.log(errorMessage);
      });
  }

  handleErrors(error) {
    console.log(JSON.stringify(error));
    return Promise.reject(error.message);
  }

  alertHandler(msg: any) {
    return alert({
      title: 'Error',
      message: `${msg}`,
      okButtonText: "OK"
    })
  }
}