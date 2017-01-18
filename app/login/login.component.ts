import { View } from 'ui/core/view';
import { OnInit } from '@angular/core';
import { FirebaseService } from './../services/firebase.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { prompt } from "ui/dialogs";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { ElementRef, ViewChild } from "@angular/core";
import { Color } from "color";


@Component({
  moduleId: module.id,
  selector: 'todo-login',
  templateUrl: 'login.html',
  styleUrls: ['login.css']
})

export class LoginComponent implements OnInit {
  user: User;
  isLoggingIn = true;
  isAuthenticating = false;
  isLoading = false;
  @ViewChild("button") button: ElementRef;
  constructor(
    private firebaseService: FirebaseService,
    private routerExtensions: RouterExtensions) {
    this.user = new User();
    this.user.email = "rafalk@gmail.com";
    this.user.password = "123321";
  }

  ngOnInit() {

  }

  submit() {
    this.isAuthenticating = true;
    if (this.isLoggingIn) {
      this.login();
    } else {
      this.signUp();
    }
  }

  login() {
    this.isLoading = true;
    this.firebaseService.login(this.user)
      .then(() => {
        this.isLoading = true;
        this.isAuthenticating = false;
        this.routerExtensions.navigate(["/"], { clearHistory: true });

      })
      .catch((message: any) => {
        this.isLoading = false;
        this.isAuthenticating = false;
      });
  }

  signUp() {
    this.firebaseService.register(this.user)
      .then(() => {
        this.isAuthenticating = false;
        this.toggleDisplay();
      })
      .catch((message: any) => {
        alert(message);
        this.isAuthenticating = false;
      });
  }

  forgotPassword() {
    prompt({
      title: "Forgot Password",
      message: "Enter the email address you used to register to reset your password.",
      defaultText: "",
      okButtonText: "Ok",
      cancelButtonText: "Cancel"
    }).then((data) => {
      if (data.result) {
        this.firebaseService.resetPassword(data.text.trim())
          .then((result: any) => {
            if (result) {
              alert(result);
            }
          });
      }
    });
  }

  toggleDisplay() {
    this.isLoggingIn = !this.isLoggingIn;
    let container = <View>this.button.nativeElement;
    container.animate({
      backgroundColor: this.isLoggingIn ? new Color("green") : new Color("#2fb2af"),
      duration: 200
    });
  }
}