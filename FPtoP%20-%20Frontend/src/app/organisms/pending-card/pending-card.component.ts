import { Component, Input, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-pending-card",
  templateUrl: "./pending-card.component.html",
  styleUrls: ["./pending-card.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PendingCardComponent {
  @Input() title: string;
  @Input() madeBy: string;
  @Input() sendDate: string;
  @Input() businessLine: string;
}
