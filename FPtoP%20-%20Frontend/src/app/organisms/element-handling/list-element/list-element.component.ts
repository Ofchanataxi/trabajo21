import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { StandardElement } from '../interfaces/interfaces.interfaces';
import { groupElementsByName, StandardElementGroup } from '../utils/standard-element.utils'; 
import { UserService, UserInfo } from 'src/app/features/auth/services/user.service';
import { Subscription } from 'rxjs'; // Importa SuBscription

@Component({
  selector: 'list-element-component',
  templateUrl: './list-element.component.html',
  styleUrls: ['./list-element.component.scss'],
})
export class ListElementComponent implements OnInit, OnChanges {
  @Input() businessLineId!: number | null;

  standardElementsList: StandardElement[] = [];
  groupedStandardElements: StandardElementGroup[] = [];
  selectedGroup: StandardElementGroup | null = null;
  idStandardElement: number | null = null;
  selectedElementValue: { viewText: string; value: number } | null = null;
  businessLineMap: { [id: number]: string } = {};
  currentSearchTerm = '';
  showModal: boolean = false;
  userIdBusinessLine: number | null = null;
  userId: number | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private catalogService: CatalogManagementService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.currentUser.subscribe(userInfo => {
      if (userInfo) {
        this.userIdBusinessLine = userInfo.idBusinessLine;
        this.userId = userInfo.id;
      } else {
        this.userIdBusinessLine = null;
        this.userId = null;
      }
    });
    this.catalogService.getStandardBusinessLines().subscribe({
      next: res => {
        for (const line of res.data) {
          this.businessLineMap[line.id] = line.name?.toUpperCase();
        }
      },
      error: err => {
        console.error('Error al obtener líneas de negocio:', err);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['businessLineId'] &&
      !changes['businessLineId'].firstChange &&
      this.businessLineId
    ) {
      this.selectedGroup = null;
      this.idStandardElement = null;
      this.selectedElementValue = null; // Resetear
      this.triggerSearch(this.currentSearchTerm);
    }
  }

  openAddElement() {
    this.showModal = true;
  }

  closeAddElement() {
    this.showModal = false;
  }

  onSearchTermChanged(term: string) {
    this.currentSearchTerm = term;
    this.selectedGroup = null;
    this.idStandardElement = null;
    this.selectedElementValue = null; // Resetear
    this.triggerSearch(term);
  }

  handleSearchIconClick() {
    this.selectedGroup = null;
    this.idStandardElement = null;
    this.selectedElementValue = null; // Resetear
    this.triggerSearch(this.currentSearchTerm);
  }

  selectElement(elementGroup: StandardElementGroup) {
    this.selectedGroup = elementGroup;
    if (
      elementGroup &&
      typeof elementGroup.id === 'number' &&
      typeof elementGroup.name === 'string'
    ) {
      this.idStandardElement = elementGroup.id;
      this.selectedElementValue = {
        viewText: elementGroup.name,
        value: elementGroup.id,
      };
    } else {
      this.idStandardElement = null;
      this.selectedElementValue = null;
    }
  }

  triggerSearch(searchTerm: string) {
    this.catalogService.getStandardElements(searchTerm, this.businessLineId).subscribe({
      next: res => {
        this.standardElementsList = res.data;
        this.groupedStandardElements = groupElementsByName(this.standardElementsList);
      },
      error: err => {
        console.error('Error al obtener elementos:', err);
        this.standardElementsList = [];
        this.groupedStandardElements = [];
      },
    });
  }

  onAtributoAgregado() {
    if (!this.selectedGroup || !this.selectedElementValue) {
      this.triggerSearch(this.currentSearchTerm);
      this.selectedGroup = null;
      this.idStandardElement = null;
      this.selectedElementValue = null;
      return;
    }
    const currentSelectedGroupId = this.selectedElementValue.value;

    this.catalogService.getStandardElements(this.currentSearchTerm, this.businessLineId).subscribe({
      next: res => {
        this.standardElementsList = res.data;
        this.groupedStandardElements = groupElementsByName(this.standardElementsList);
        const reselectedGroup = this.groupedStandardElements.find(
          group => group.id === currentSelectedGroupId
        );

        if (reselectedGroup) {
          this.selectElement(reselectedGroup);
        } else {
          this.selectedGroup = null;
          this.idStandardElement = null;
          this.selectedElementValue = null;
        }
      },
      error: err => {
        console.error('Error al actualizar y re-seleccionar elementos:', err);
        this.selectedGroup = null;
        this.idStandardElement = null;
        this.selectedElementValue = null;
      },
    });
  }

  // Asegúrate de desuscribirte para evitar memory leaks
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  public getSynonymsPreview(elementGroup: StandardElementGroup): string {
    if (!elementGroup?.elementos?.[0]?.synonyms) {
      return '';
    }
    // Devuelve directamente el string de sinónimos que ya viene del backend.
    return elementGroup.elementos[0].synonyms;
  }
}
