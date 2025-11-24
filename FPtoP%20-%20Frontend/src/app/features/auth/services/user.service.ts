import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../auth.service';
import { Router } from '@angular/router';

export interface UserInfo {
  id: number;
  nameUser: string;
  email: string;
  idBusinessLine: number;
  nameBusinessLine: string;
  nameCompany: string;
  rol: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private UserInfoBehavior = new BehaviorSubject<any>(null);
  currentUser = this.UserInfoBehavior.asObservable();

  async saveUserInfo(data: any) {
    const userInfo: UserInfo = {
      id: data.idUsers,
      nameUser: `${data.firstName} ${data.lastName}`,
      email: data.email,
      idBusinessLine: data.idStandardBusinessLines,
      nameBusinessLine: data.NameStandardBusinessLines,
      nameCompany: data.NameStandardCompany,
      rol: data.NameStandardUsersRoles,
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    this.UserInfoBehavior.next(userInfo);
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      sessionStorage.removeItem('returnUrl');
    } else {
      this.router.navigate(['/home']);
    }
  }

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.UserInfoBehavior.next(JSON.parse(storedUser)); // Cargar usuario almacenado
    }
  }
}
