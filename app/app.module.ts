import { TodoListModule } from './todoeslist/todo-list.module';
import { TodoModule } from './todo/todo.module';
import { LoginModule } from './login/login.module';
import { NativeScriptModule } from "nativescript-angular/platform";
import { NgModule } from "@angular/core";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { LoginComponent } from './login/login.component'
import { TokenService } from './services/token.service';
import { CommonService } from './services/common.service';
import { FirebaseService } from './services/firebase.service';
import { AppComponent } from "./app.component";
import { authProviders, appRoutes } from "./app.routes";

@NgModule({
  providers: [
    TokenService,
    FirebaseService,
    CommonService,
    authProviders
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptHttpModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(appRoutes),
    LoginModule,
    TodoListModule,
    TodoModule
  ]
})
export class AppModule { }
