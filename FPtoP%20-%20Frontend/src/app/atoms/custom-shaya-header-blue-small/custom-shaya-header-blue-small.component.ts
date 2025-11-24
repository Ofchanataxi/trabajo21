import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-custom-shaya-header-blue-small",
  templateUrl: "./custom-shaya-header-blue-small.component.html",
  styleUrls: ["./custom-shaya-header-blue-small.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CustomShayaHeaderBlueSmallComponent implements OnInit {
  @Input() headerTitle: string;

  ngOnInit() {
   this.headerTitle;
  }
}
