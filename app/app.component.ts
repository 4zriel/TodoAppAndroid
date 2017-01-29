import { Component } from "@angular/core";
import * as application from "application";
import * as platform from "platform";
import * as utils from "utils/utils";
declare var android: any;
declare var UIResponder: any;
declare var UIStatusBarStyle: any;
declare var UIApplication: any;
declare var UIApplicationDelegate: any;
import firebase = require("nativescript-plugin-firebase");

import { TokenService } from "./services/token.service";

@Component({
  selector: "my-app",
  template: "<page-router-outlet></page-router-outlet>"
})
export class AppComponent {
  constructor() {
    this.setStatusBarColors();
    firebase.init({
      persist: false,
      storageBucket: 'gs://todoapp-a62ff.appspot.com',
      onAuthStateChanged: (data: any) => {
        console.log(JSON.stringify(data))
        if (data.loggedIn) {
          TokenService.token = data.user.uid;
        }
        else {
          TokenService.token = "";
        }
      }
    }).then(
      function (instance) {
        console.log("firebase.init done");
      },
      function (error) {
        console.log("firebase.init error: " + error);
      }
      );
  }

  private setStatusBarColors() {
    if (application.android) {
      application.android.onActivityStarted = function () {
        if (application.android && platform.device.sdkVersion >= "21") {
          let View = android.view.View;
          let window = application.android.startActivity.getWindow();
          window.setStatusBarColor(0x000000);

          let decorView = window.getDecorView();
          decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
      };
    }
  }
}
