import { todoListRouting } from './todo-list.routes';
import { TodoListComponent } from './todo-list.component';
import { NativeScriptModule } from "nativescript-angular/platform";
import { NgModule } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SIDEDRAWER_DIRECTIVES } from "nativescript-telerik-ui/sidedrawer/angular";
import { LISTVIEW_DIRECTIVES } from 'nativescript-telerik-ui/listview/angular';

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    todoListRouting
  ],
  declarations: [
    TodoListComponent,
    SIDEDRAWER_DIRECTIVES,
    LISTVIEW_DIRECTIVES
  ]
})
export class TodoListModule { }