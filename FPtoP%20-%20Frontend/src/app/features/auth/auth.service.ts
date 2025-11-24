import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserData {
  user: User;
  userGroups: UserGroup[];
  modulesAccess: string[];
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

export interface UserGroup {
  id: number;
  name: string;
  pageAllowAccess: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'access_token';
  private userData = new BehaviorSubject<any>(null);
  public currentUser = this.userData.asObservable();
  private isLoggedIn = false;

  setUserData(data: any) {
    this.userData.next(data);
    console.log('usuario actual', data);
  }

  //AUNTENTICACION PARA EL GUARD
  async isAuthenticated(): Promise<boolean> {
    try {
      const statusUrl = environment.apiBaseUrl + environment.endpoints.status.url;
      const authResponse = await firstValueFrom(this.http.get<boolean>(statusUrl));
      return authResponse;
    } catch (error) {
      return false;
    }
  }

  isPathAllowed(route: string): boolean {
    const storedPath: string[] = JSON.parse(sessionStorage.getItem('userPath')!);
    const isAllowed = storedPath.includes(route);
    return isAllowed;
  }

  inLogin(user: any) {
    const userPath: string[] = user.userGroups[0].pageAllowAccess;
    this.isLoggedIn = true;
    this.userData = user;
    console.log('El usuario tiene acceso a ', userPath);
    sessionStorage.setItem('userData', JSON.stringify(user));
    sessionStorage.setItem('userPath', JSON.stringify(userPath));
  }

  logout() {
    this.isLoggedIn = false;
    sessionStorage.removeItem('userData');
    localStorage.clear();
    console.log('clic de salida');
  }

  getUserDataSaved() {
    return this.userData;
  }

  constructor(private http: HttpClient) {
    // Almacenar un token de ejemplo en el almacenamiento de sesión al inicializar el servicio
    const exampleToken = 'testSHAYA'; // Este es el token "quemado"
    sessionStorage.setItem(this.tokenKey, exampleToken);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.clear();
  }

  // Ejemplo de una llamada HTTP a un endpoint de autenticación
  // login(username: string, password: string): Observable<any> {
  //   console.log("Llamada a login servicio");
  //   const authType = "office365"
  //   window.location.href = environment.apiBaseUrl + environment.endpoints.login.url + `?authType=${authType}`;

  //   //return this.http.post(`${environment.apiBaseUrl}/auth/login`, { username, password });
  //   //return true;
  // }

  login(username: string, password: string): any {
    console.log('Llamada a login servicio');
    const authType = 'office365';
    window.location.href =
      environment.apiBaseUrl + environment.endpoints.login.url + `?authType=${authType}`;
  }

  // SSO new routes
  // ----------------------------------------------------------------
  signin(): any {
    console.log('Se llama al servicio de Auth Service para SSO');
    const authType = 'office365';
    const url = environment.apiBaseUrl + environment.endpoints.login.url + `?authType=${authType}`;

    this.http.get(url, { withCredentials: true }).subscribe((res: any) => {
      console.log('Respuesta del backend');
      console.log(res);
      if (res.redirectTo) {
        window.location.href = res.redirectTo;
      }
    });

    // console.log('URL de redireccion: ', url);
    // window.location.href = url;
  }

  getTokens(code: string): Observable<any> {
    const authType = 'office365';
    const redirectUrl = environment.apiBaseUrl + environment.endpoints.acquireToken.url;
    const headers = new HttpHeaders({
      authType: 'authType',
    });

    const params = new HttpParams().set('authType', authType).set('code', code);

    return this.http.get(redirectUrl, {
      headers,
      params,
      withCredentials: true, // 💥 esto asegura que la cookie connect.sid se reenvíe
    });
  }

  async signout(): Promise<void> {
    this.isLoggedIn = false;
    sessionStorage.removeItem('userData');
    const signOutUrl = environment.apiBaseUrl + environment.endpoints.logout.url;
    window.location.href = signOutUrl;
    localStorage.clear();
  }

  private static handleAuthError(err: HttpErrorResponse | any) {
    return Observable.call(err.message || 'Error: Imposible realizar la peticion');
  }

  getUserData(userId: number): Observable<any> {
    const apiURL = environment.apiBaseUrl + `auth/userData?userId=${userId}`;
    return this.http.get<any>(apiURL).pipe(
      map((res: UserData) => {
        sessionStorage.setItem('user', JSON.stringify(res.user));
        return res;
      }),
      catchError(error => {
        console.error('Este Error viene del usuario', error);
        throw error;
      })
    );
  }

  getUserSession(): any {
    if (sessionStorage.getItem('user') === undefined) return;
    return JSON.stringify(sessionStorage.getItem('user'));
  }

  getAllowedPathData(userId: number): Observable<any> {
    const apiURL = environment.apiBaseUrl + `auth/userData?userId=${userId}`;
    return this.http.get<any>(apiURL).pipe(
      map((res: UserData) => {
        sessionStorage.setItem('allowedPath', JSON.stringify(res.userGroups[0].pageAllowAccess));
        return res.userGroups[0].pageAllowAccess as string[];
      }),
      catchError(error => {
        console.error('Este Error viene del path de usuario', error);
        throw error;
      })
    );
  }
  getAllowedFunctionsData(userId: number): Observable<any> {
    const apiURL = environment.apiBaseUrl + `auth/userData?userId=${userId}`;
    return this.http.get<any>(apiURL).pipe(
      map((res: UserData) => {
        return res.modulesAccess as string[];
      }),
      catchError(error => {
        console.error('Este Error viene del modulo del usuario', error);
        throw error;
      })
    );
  }

  getUserID() {
    return this.currentUser.pipe(
      map((user: UserData) => {
        return user.user.id;
      }),
      catchError(error => {
        console.error('No hay usuario activo', error);
        throw error;
      })
    );
  }
}
