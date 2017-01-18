import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";

import { TokenService } from "./token.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate() {
    if (TokenService.isLoggedIn()) {
      return true;
    }
    else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}

