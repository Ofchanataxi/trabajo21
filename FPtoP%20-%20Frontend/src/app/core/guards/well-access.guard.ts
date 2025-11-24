import { Inject, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/auth.service';

export const wellAccessGuard: CanActivateFn = (route, state) => {
  const requiredRoles = route.data.roles as Array<string>;
  const roleService = Inject(AuthService);
  const router = Inject(Router);

  console.log("desde el guard",route.data)

  return true;


};
