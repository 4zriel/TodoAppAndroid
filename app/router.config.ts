import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './login/login.component';
import { Route } from '@angular/router';

export const routerConfig: Route[] = [

  {
    'path': 'login',
    component: LoginComponent
  },
];
