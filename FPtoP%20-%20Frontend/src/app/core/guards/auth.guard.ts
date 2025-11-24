import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import {
  AuthService,
  User,
  UserData,
} from "src/app/features/auth/auth.service";

export const authGuard: CanActivateFn = async (route, state) => {
  const routes = inject(Router);
  const authService = inject(AuthService);
  let isAuthenticated = true;

  isAuthenticated = await authService.isAuthenticated();
  if (!isAuthenticated) {
    routes.navigate(["/auth/login"]);
    return false;
  }
  return true;
};
