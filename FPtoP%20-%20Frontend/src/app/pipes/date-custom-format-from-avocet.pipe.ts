import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment-timezone';

@Pipe({
  name: 'dateCustomFormatFromAvocet',
})
export class DateCustomFormatFromAvocetPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const cleanedValue = value.replace(/Z$/, '');
    const date = moment.tz(cleanedValue, 'America/Bogota');
    return date.format('YYYY-MM-DD | HH:mm:ss Z');
  }
}
