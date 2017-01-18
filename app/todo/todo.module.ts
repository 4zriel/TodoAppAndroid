import { todoRouting } from './todo.routes';
import { TodoComponent } from './todo.component';
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NgModule } from "@angular/core";


@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    todoRouting
  ],
  declarations: [
    TodoComponent
  ]
})
export class TodoModule { }
