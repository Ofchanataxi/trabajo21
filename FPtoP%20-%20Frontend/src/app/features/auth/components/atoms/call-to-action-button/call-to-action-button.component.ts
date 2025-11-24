import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AuthService, UserData } from '../../../auth.service';
import { event } from 'cypress/types/jquery';

@Component({
  selector: 'auth-call-to-action-button',
  templateUrl: './call-to-action-button.component.html',
  styles: [
  ]
})
export class CallToActionButtonComponent {


  @Input() label: string;
  @Input() color: string = "white";
  @Input() backgroundColor: string = "#FF0000";
  @Input() size: string = "large";
  @Input() isPrimary: boolean = true;
  @Input() function: Function;
  @Input() disable: boolean = false;
  @Input() isError: boolean = false;
  @Input() userID: number;

  @Output() newItemEvent = new EventEmitter<string>();

  constructor (private authService : AuthService){}




  onClick():void{

    this.authService.getUserData(this.userID)
    .subscribe((res:any) => {
      console.log(res)
      this.newItemEvent.emit(res);
    }
    );

  }



}
