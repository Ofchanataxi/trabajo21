import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-custom-shaya-header-greenSheen',
  templateUrl: './custom-shaya-header-greenSheen.component.html',
  styleUrls: ['./custom-shaya-header-greenSheen.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomShayaHeaderComponentGreenSheen implements OnInit {
  @Input() headerTitle: string;
  @Input() isErrorHeader: boolean;
  themeClass = 'stardard-theme-shaya-header-greenSheen';

  ngOnInit() {
    if(this.isErrorHeader) this.themeClass = 'error-theme-shaya-header-greenSheen';
  }
}
