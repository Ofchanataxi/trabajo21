import { SlbThemingOptions } from '@slb-dls/angular-material/core';

export enum Themes {
    Light = 'light',
    Dark = 'dark',
}

export const themeConfig: SlbThemingOptions = {
    defaultTheme: 'light',
    classMap: new Map<string, string[]>([
        [
            Themes.Light,
            [ 'material-theme-light' ],
        ],
        [
            Themes.Dark,
            [ 'material-theme-dark' ],
        ],
    ]),
    stylesheetMap: new Map<string, string[]>([
        [
            Themes.Light,
            [
                'dls-mat-light-theme.css',
                'app-light-theme.css',
            ],
        ],
        [
            Themes.Dark,
            [
                'dls-mat-dark-theme.css',
                'app-dark-theme.css',
            ],
        ],
    ]),
};
