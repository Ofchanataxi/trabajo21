import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-custom-shaya-header',
  templateUrl: './custom-shaya-header.component.html',
  styleUrls: ['./custom-shaya-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomShayaHeaderComponent  implements OnInit {
  @Input() headerTitle: string;
  @Input() isErrorHeader: boolean;
  errorTheme = 'stardard-theme';

  ngOnInit() {
    if(this.isErrorHeader) this.errorTheme = 'error-theme';
  }

}
