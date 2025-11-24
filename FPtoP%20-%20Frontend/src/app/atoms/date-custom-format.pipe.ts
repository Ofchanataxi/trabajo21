import { Pipe, PipeTransform, Injectable } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateCustomFormat',
})
@Injectable({ providedIn: 'root' }) // Permite la inyección
export class DateCustomFormatPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';
    const date = moment(value);
    return date.format('YYYY-MM-DD | HH:mm:ss Z');
  }
}