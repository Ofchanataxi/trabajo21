import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { TeamsService } from "src/app/services/teams.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit, OnDestroy {
  user!: UserInfo;
  private userSubscription!: Subscription;

  route = environment.frontEndpoints.releases.support.url;
  urlRedirect = '/' + this.route;

  constructor(
    private teamsService: TeamsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  contactSupport(): void {
    if (this.user) {
      this.teamsService.openTeamsChat(this.user);
    } else {
      console.warn('Usuario no disponible para soporte.');
    }
  }

  ngOnDestroy(): void {
    // Evitar fugas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
