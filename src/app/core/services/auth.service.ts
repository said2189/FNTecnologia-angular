import { LoginRequestDto, LoginResponseDto } from '../models/auth.dto';
import { HttpClient } from "@angular/common/http";
import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environment';
import { tap } from 'rxjs/operators';

interface JwtPayload { exp: number; sub?: string; role?: string; roles?: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(localStorage.getItem('jwt'));
  public isAuthenticated = computed(() => !!this.tokenSignal());
  public userId = computed(() => {
    const t = this.tokenSignal();
    if (!t) return null;
    try { return (jwtDecode(t) as any).sub; } catch { return null; }
  });

public userRole = computed(() => {
  const t = this.tokenSignal();
  if (!t) return null;

  try {
    const payload: any = jwtDecode(t);

    const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    if (payload[roleClaim]) return payload[roleClaim];
    if (payload.role) return payload.role;
    if (payload.roles && payload.roles.length > 0) return payload.roles[0];

    return null;
  } catch {
    return null;
  }
});


  private logoutTimerId: any = null;

  constructor(private http: HttpClient, private router: Router) {
    effect(() => {
      const token = this.tokenSignal();
      this.clearLogoutTimer();
      if (token) this.scheduleAutoLogout(token);
    });
  }

  login(dto: LoginRequestDto) {
    return this.http.post<LoginResponseDto>(`${environment.apiUrlAuth}/Auth/login`, dto).pipe(
      tap((res: LoginResponseDto) => this.setToken(res.token))
    );
  }

  private setToken(token: string) {
    localStorage.setItem('jwt', token);
    this.tokenSignal.set(token);
  }

  logout() {
    localStorage.removeItem('jwt');
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken() { return this.tokenSignal(); }

  private scheduleAutoLogout(token: string) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const expiresAt = payload.exp * 1000;
      const ms = expiresAt - Date.now();
      if (ms <= 0) { this.logout(); return; }
      this.logoutTimerId = setTimeout(() => this.logout(), ms);
    } catch {
      this.logout();
    }
  }

  private clearLogoutTimer() {
    if (this.logoutTimerId) { clearTimeout(this.logoutTimerId); this.logoutTimerId = null; }
  }
}