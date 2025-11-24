import { Input, Component, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'show-idStandardWell-InfrastructureType',
  templateUrl: './show-idStandardWell-InfrastructureType.component.html',
  styleUrls: ['./show-idStandardWell-InfrastructureType.component.scss'],
})
export class ShowIdStandardWellInfrastructureTypeComponent implements OnInit, OnChanges {
  constructor(private catalogManagementService: CatalogManagementService) {}

  @Input() initialSelectedId: number | null = null;
  @Output() idSelected = new EventEmitter<number | null>();

  idStandardWellInfrastructureTypeList: StandardBusinessLineOption[] = [];
  selectedIdStandardWellInfrastructureTypeLines: number | null = null;

  ngOnInit(): void {
    this.obtainStandardCondition();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['initialSelectedId'] && this.initialSelectedId !== undefined) {
          this.selectedIdStandardWellInfrastructureTypeLines = this.initialSelectedId;
      }
  }

  obtainStandardCondition() {
    this.catalogManagementService.getStandardWellInfrastructureType().subscribe({
      next: (response: any) => {
        this.idStandardWellInfrastructureTypeList = response.data.map((element: any) => ({
          id: element.id,
          name: element.name?.toUpperCase(),
        }));

        if (this.initialSelectedId !== null) {
          this.selectedIdStandardWellInfrastructureTypeLines = this.initialSelectedId;
        }
        this.idSelected.emit(this.selectedIdStandardWellInfrastructureTypeLines);
      },
      error: err => console.error('Error al obtener los datos:', err),
    });
  }

  conditionSelected(event: any) {
    const selectedId = parseInt(event, 10);
    this.selectedIdStandardWellInfrastructureTypeLines = selectedId;
    this.idSelected.emit(selectedId);
  }
}

interface StandardBusinessLineOption {
  id: number;
  name: string;
}