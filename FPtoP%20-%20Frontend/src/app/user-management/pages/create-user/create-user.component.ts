import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
  firstName: string = '';
  surName: string = '';
  email: string = '';
  microsoftId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.firstName = params.get('firstName') || '';
      this.surName = params.get('surName') || '';
      this.email = params.get('email') || '';
      this.microsoftId = params.get('microsoftId') || '';

      console.log(`firstName: ${this.firstName}`);
      console.log(`surName: ${this.surName}`);
      console.log(`email: ${this.email}`);
      console.log(`microsoftId: ${this.microsoftId}`);
    });
  }
}
