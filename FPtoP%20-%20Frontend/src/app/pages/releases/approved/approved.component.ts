import {
    Input,
    Component,
    inject
} from "@angular/core";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss'],
})
export class ApprovedComponent { 
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