import { Component } from '@angular/core';
import { MessageService, SlbSeverity, SlbMessageTarget } from '@slb-dls/angular-material/notification';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {

  constructor(private messageService: MessageService) { }

  sayHello(target: SlbMessageTarget): void {
    this.messageService.add({
      severity: SlbSeverity.Info,
      detail: 'Welcome to <b>DLS Agular Material Boilerplate</b> app!',
      summary: 'Hello',
      asHtml: true,
      target,
    });
  }

}
