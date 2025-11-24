import {
    Input,
    Component,
    inject
} from "@angular/core";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'pec-review',
  templateUrl: './pec-review.component.html',
  styleUrls: ['./pec-review.component.scss'],
})
export class PECReviewComponent { 
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