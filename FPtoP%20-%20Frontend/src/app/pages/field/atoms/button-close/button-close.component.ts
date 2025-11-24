import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent {
  colorStyleValues = ["white", "green"];

  @Input() label: string = "hola";
  @Input() color: string;
  @Input() backgroundColor: string;
  @Input() size: string = "large";
  @Input() isPrimary: boolean = true;
  @Input() function: Function;
  @Input() disable: boolean = false;
  @Input() isError: boolean = false;

  errorStylesAttr: { [key: string]: any } = {
    "background-color": "#7C2020",
    color: "white !important",
    "border-color": "#7C2020",
    "border-radius": "10px",
  };

  ngOnInit(): void {
    if (this.isPrimary) {
      this.color = "accent";
    } else {
      this.color = "black";
    }
  }
}
