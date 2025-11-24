import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '@slb-dls/angular-material/core';
import { LinkItem } from '@slb-dls/angular-material/shared';
import { Themes } from '../../themes/theme.config';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  host: {
    'class': 'app-theme-switcher',
  },
  encapsulation: ViewEncapsulation.None,
})
export class ThemeSwitcherComponent {

  isDarkTheme = false;

  secondaryLinks: LinkItem[] = [];

  constructor(
    private themesService: ThemeService) {
    this.themesService.themeChanged.subscribe(newTheme => {
      this.isDarkTheme = newTheme === Themes.Dark;
    });
  }

  _onThemeToggleChange(): void {
    this.themesService.switchTheme(this.isDarkTheme ? Themes.Dark : Themes.Light);
  }

  _onButtonClick() {
    this.isDarkTheme = !this.isDarkTheme;
    this._onThemeToggleChange();
  }
}
