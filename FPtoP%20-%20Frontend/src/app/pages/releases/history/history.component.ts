import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  QueryList,
  inject,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReleaseService } from 'src/app/services/release.service';
import { DateCustomFormatPipe } from 'src/app/atoms/date-custom-format.pipe';

interface ReleaseHistoryItem {
  isForward: boolean;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  etapaInicio: string | null;
  etapaFin: string;
  changeReason: string;
  changeTimestamp: string;
}

@Component({
  selector: 'history-release',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HistoryReleaseComponent implements OnInit {
  constructor(
    private releaseService: ReleaseService,
    private route: ActivatedRoute,
    public dateCustomFormatPipe: DateCustomFormatPipe
  ) {}
  releaseId: number = 0;

  releaseHistoryData: ReleaseHistoryItem[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const value = params.get('releaseId');
      const releaseIDValue = value !== null ? parseInt(value, 10) : 0;
      this.releaseId = releaseIDValue;

      // Solo ejecuta esta parte si releaseId tiene un valor válido
      if (this.releaseId && this.releaseId !== 0) {
        this.releaseService.getReleaseHistory(this.releaseId).subscribe({
          next: (response: any) => {
            this.releaseHistoryData = response.data;
            // console.log('getReleaseHistory response.data:', response.data);

            // Iterar sobre los datos e imprimir changeReason
            this.releaseHistoryData.forEach(item => {
              console.log(
                'changeReason:',
                item.changeReason ? item.changeReason : 'Sin comentarios registrados'
              );
            });
          },
          error: err => {
            console.error('Error al obtener los datos:', err);
          },
        });
      }
    });
  }
}
