import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { HttpRequest } from '@angular/common/http';
import { Subject, filter, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnDestroy {
  public isLoading = false;
  public currentRequest: HttpRequest<any> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.loadingService.isLoading
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(loading => {
        // 👇 evita NG0100 si la emisión ocurre durante el mismo ciclo
        queueMicrotask(() => {
          this.isLoading = loading;
          this.currentRequest = loading ? this.loadingService.getCurrentRequest() : null;
        });
      });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        /* opcional */
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
