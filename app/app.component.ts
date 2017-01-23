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
import LocalNotifications = require("nativescript-local-notifications");
@Component({
  selector: "my-app",
  template: "<page-router-outlet></page-router-outlet>"
})
export class AppComponent {
  constructor() {
    this.setStatusBarColors();
    application.on(application.suspendEvent, () => {
      LocalNotifications.schedule([{
        id: 111,
        title: 'title',
        body: 'body',
        ticker: 'ticker',
        badge: 1,
        at: new Date(new Date().getTime() + 5 * 1000)
      }]).then(
        () => {
          console.log("Notification scheduled");
        },
        (error) => {
          console.log("scheduling error: " + error);
        })
    });
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
      LocalNotifications.schedule([{
        id: 8,
        title: 'The title',
        body: 'The body',
        at: new Date(new Date().getTime() + (10 * 1000))
      }]).then(
        onValue => {
          console.log("ID's: ")
        },
        error => {
          LocalNotifications.cancelAll();
        })
    }
  }
}
