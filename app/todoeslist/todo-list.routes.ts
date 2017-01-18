import { TodoListComponent } from './todo-list.component';
import { AuthGuard } from './../services/auth.guard';
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";


const todoListRoutes: Routes = [
  { path: "", component: TodoListComponent, canActivate: [AuthGuard] },
];
export const todoListRouting: ModuleWithProviders = RouterModule.forChild(todoListRoutes);