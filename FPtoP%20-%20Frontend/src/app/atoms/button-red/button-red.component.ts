import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-button-red",
  templateUrl: "./button-red.component.html",
  styleUrls: ["./button-red.component.scss"],
})
export class ButtonRedComponent implements OnInit {
  colorStyleValues = ["white", "red"];

  @Input() label: string = "Click";
  @Input() color: string = "white"; 
  @Input() backgroundColor: string = "#FF0000"; 
  @Input() size: string = "large";
  @Input() isPrimary: boolean = true;
  @Input() function: Function;
  @Input() disable: boolean = false;
  @Input() isError: boolean = false;

  errorStylesAttr: { [key: string]: any } = {
    "background-color": "#7C2020",
    color: "white",
    "border-color": "#7C2020",
    "border-radius": "10px",
  };

  ngOnInit(): void {
    if (this.isPrimary) {
      this.color = this.color || "white";
      this.backgroundColor = this.backgroundColor || "#FF0000"; 
    } else {
      this.color = this.color || "black";
      this.backgroundColor = this.backgroundColor || "#D3D3D3"; 
    }
  }
}
