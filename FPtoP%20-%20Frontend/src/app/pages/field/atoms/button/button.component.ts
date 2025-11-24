import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-field-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class FieldButtonComponent implements OnInit {
  @Input() label: string = "Click";
  @Input() color: string = "";
  @Input() backgroundColor: string = ""; 
  @Input() size: string = "large";
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
  
    this.color = this.color || "black"; 
    this.backgroundColor = this.backgroundColor || "shayaGreen";
  }

  getButtonClass(): string {
    switch (this.backgroundColor) {
      case 'shayaRed':
        return 'shaya-red-background';
      case 'shayaGreen':
        return 'shaya-green-background';
      case 'shayaBlue':
        return 'shaya-blue-background';
      case 'shayaWhite':
        return 'shaya-white-background';
      case 'shayaSecond':
        return 'shaya-Second-background';
      default:
        return 'shaya-green-background'; 
    }
  }

  getBackgroundColor(): string {
    return `var(--${this.backgroundColor})`; 
  }

  getTextColor(): string {
    return `var(--${this.color})`; 
  }
}
