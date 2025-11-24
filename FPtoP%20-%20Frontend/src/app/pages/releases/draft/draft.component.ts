import {
    Input,
    Component,
    inject,
    OnInit,
    OnDestroy
} from "@angular/core";
import { Subscription } from "rxjs";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
})
export class DraftComponent implements OnInit, OnDestroy{
  segments = ["logistic/", "als/", "completion/", "cameron/", "iwc/"];
  public user : UserInfo;
  private userSerivce = inject(UserService);
  private userSuscription: Subscription;
  urlRedirect = environment.frontEndpoints.releases.draft.url+'/edit';
  //'/' + this.route
  ngOnInit(): void {
    this.userSuscription = this.userSerivce.currentUser.subscribe(currentUser => {
      this.user = currentUser
    })
  }

  ngOnDestroy(): void {
    this.userSuscription.unsubscribe();
  }
}
