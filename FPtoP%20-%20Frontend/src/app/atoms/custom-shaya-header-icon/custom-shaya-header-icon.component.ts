import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-custom-shaya-header-icon",
  templateUrl: "./custom-shaya-header-icon.component.html",
  styleUrls: ["./custom-shaya-header-icon.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CustomShayaHeaderIconComponent implements OnInit {
  @Input() headerTitle: string;
  @Input() headerIcon: string;
  @Input() isErrorHeader: boolean;
  errorTheme = "stardard-theme";

  ngOnInit() {
    if (this.isErrorHeader) this.errorTheme = "error-theme";
  }
}
