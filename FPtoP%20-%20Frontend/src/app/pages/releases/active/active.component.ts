import {
    Input,
    Component,
    inject
} from "@angular/core";
import { Router } from "@angular/router";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'shared-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss'],
})
export class ActiveComponent { 

    constructor(
        
    ) {}
    
    public user : UserInfo;

    private userSerivce = inject(UserService);
    ngOnInit(): void {
      this.userSerivce.currentUser.subscribe(currentUser => {
        this.user = currentUser
      })
    }

}