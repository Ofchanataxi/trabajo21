import {Component, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';

@Component({
  selector: 'show-standardAttributeTypes',
  templateUrl: './show-StandardAttributeTypes.component.html',
})
export class ShowStandardAttributeTypes implements OnChanges, OnInit {
  constructor(private catalogManagementService: CatalogManagementService) {}
  @Input() preselectedTypeId: number | null = null;
  @Output() idSelected = new EventEmitter<number | null>();

  idShowStandardAttributeTypesList: StandardBusinessLineOption[] = [];
  selectedShowStandardAttributeTypesSections: number | null = null;

  ngOnInit(): void {
    this.obtainStandardCondition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preselectedTypeId'] && this.preselectedTypeId !== null) {
      this.selectedShowStandardAttributeTypesSections = this.preselectedTypeId;
      this.idSelected.emit(this.preselectedTypeId);
    }
  }

  obtainStandardCondition() {
    this.catalogManagementService.getStandardAttributeTypes().subscribe({
      next: (response: any) => {
        const filteredData = response.data.filter(
          (element: any) => element.type?.toUpperCase() === 'LIST'
        );

        this.idShowStandardAttributeTypesList = filteredData.map((element: any) => ({
          id: element.id,
          type: element.type?.toUpperCase(),
        }));
        if (this.idShowStandardAttributeTypesList.length === 1 && this.preselectedTypeId === null) {
          const defaultOptionId = this.idShowStandardAttributeTypesList[0].id;
          this.selectedShowStandardAttributeTypesSections = defaultOptionId;
          this.idSelected.emit(defaultOptionId);
        }
      },
      error: err => console.error('Error al obtener los datos:', err),
    });
  }

  conditionSelected(event: any) {
    const selectedId = parseInt(event, 10);
    this.selectedShowStandardAttributeTypesSections = selectedId;
    this.idSelected.emit(selectedId);
  }
}

// ✅ Interfaz local dentro del componente
interface StandardBusinessLineOption {
  id: number;
  type: string;
}
