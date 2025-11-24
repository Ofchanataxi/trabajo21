import { Input, Component, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'show-idStandard-WellSections',
  templateUrl: './show-idStandard-WellSections.component.html',
})
export class ShowIdStandardWellSectionsComponent implements OnInit, OnChanges {
  constructor(private catalogManagementService: CatalogManagementService) {}

  @Input() initialSelectedId: number | null = null;
  @Output() idSelected = new EventEmitter<number | null>();

  idStandardWellSectionsList: StandardBusinessLineOption[] = [];
  selectedIdStandardWellSections: number | null = null;

  ngOnInit(): void {
    this.obtainStandardCondition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSelectedId'] && this.initialSelectedId !== undefined) {
      this.selectedIdStandardWellSections = this.initialSelectedId;
    }
  }

  obtainStandardCondition() {
    this.catalogManagementService.getStandardWellSections().subscribe({
      next: (response: any) => {
        this.idStandardWellSectionsList = response.data.map((element: any) => ({
          id: element.id,
          name: element.name?.toUpperCase(),
        }));

        if (this.initialSelectedId !== null) {
          this.selectedIdStandardWellSections = this.initialSelectedId;
        }

        this.idSelected.emit(this.selectedIdStandardWellSections);
      },
      error: err => console.error('Error al obtener los datos:', err),
    });
  }

  conditionSelected(event: any) {
    const selectedId = parseInt(event, 10);
    this.selectedIdStandardWellSections = selectedId;
    this.idSelected.emit(selectedId);
  }
}

interface StandardBusinessLineOption {
  id: number;
  name: string;
}