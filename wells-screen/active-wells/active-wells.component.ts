import { Component, EventEmitter, inject, Output, ViewChild } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";

@Component({
  selector: "active-wells",
  templateUrl: "./active-wells.component.html",
  styleUrls: ["./active-wells.component.scss"],
})
export class ActiveWellsComponent {
    public user : UserInfo;
    private userSerivce = inject(UserService);
    ngOnInit(): void {
      this.userSerivce.currentUser.subscribe(currentUser => {
        this.user = currentUser
      })
    }
    route = environment.frontEndpoints.releases.review.url;
    urlRedirect = '/'+this.route;
}
