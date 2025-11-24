import { Component, Input } from "@angular/core";

@Component({
  selector: "app-reject-approve-card",
  templateUrl: "./reject-approve-card.component.html",
  styleUrls: ["./reject-approve-card.component.scss"],
})
export class RejectApproveCardComponent {
  @Input() title: string;
  @Input() date: string;
  @Input() isApproved: boolean = false;
}
