import { TodoComponent } from './todo.component';
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const todoRoutes: Routes = [
  { path: "todo/:id", component: TodoComponent },
];

export const todoRouting: ModuleWithProviders = RouterModule.forChild(todoRoutes);