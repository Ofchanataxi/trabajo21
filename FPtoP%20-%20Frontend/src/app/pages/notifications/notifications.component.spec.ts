import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';
import { MessageService, SlbNotificationModule } from '@slb-dls/angular-material/notification';
import { SlbButtonModule } from '@slb-dls/angular-material/button';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        SlbButtonModule,
        SlbNotificationModule,
      ],
      declarations: [ NotificationsComponent ],
      providers: [MessageService],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
