// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { support } from 'cypress/types/jquery';
import { getDocument } from 'pdfjs-dist';
import { fromEvent } from 'rxjs';
import { sharedEnvironment } from './environment.shared';

export const environment: any = {
  production: true,
  apiBaseUrl: 'https://fp2p-server-hqdfdjerfyfdakbz.eastus-01.azurewebsites.net/',
  // serverUrl: "https://shaya-dhs-servidor.azurewebsites.net/",
  serverUrl: 'https://fp2p-server-hqdfdjerfyfdakbz.eastus-01.azurewebsites.net/',
  javaServer: 'https://shaya-backend-java-fqd6dccng6abbrhb.eastus-01.azurewebsites.net/',
  pythonServer: 'https://fp2p-python-a0dxh7d0hweta8h2.eastus-01.azurewebsites.net/',
  frontEndServer: 'https://fp2p-frontend-cwfqadh9egh6fwgd.eastus-01.azurewebsites.net/',
  ...sharedEnvironment,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
