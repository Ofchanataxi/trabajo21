import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/features/auth/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService) {}

  role: string;
  ngOnInit() {

  }

  changeRol() {
    // this.authService.toggleNumberRol(num);
  }
}
