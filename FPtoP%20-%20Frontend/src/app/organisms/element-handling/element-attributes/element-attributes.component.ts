import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnInit,
  OnChanges,
} from '@angular/core';
import { StandardElementGroup } from '../utils/standard-element.utils';
import { StandardElement } from '../interfaces/interfaces.interfaces';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { StandardAttributeOption, Synonym } from '../interfaces/interfaces.interfaces';
import { StandardAttributes } from '../interfaces/interfaces.interfaces';

@Component({
  selector: 'app-element-attributes',
  templateUrl: './element-attributes.component.html',
  styleUrls: ['./element-attributes.component.scss'],
})
export class ElementAttributesComponent implements OnInit, OnChanges {
  // Implementar OnInit y OnChanges
  @Input() elementGroup!: StandardElementGroup;
  @Input() idStandardElement!: number | null;
  @Input() idBusinessLineUser!: number | null;
  @Input() idUser!: number | null;
  @Input() disabledAll: boolean = false;
  @Output() updateElements = new EventEmitter<void>();

  showModal: boolean = false;
  showAddSynonymsModal: boolean = false;
  editPosition: boolean = false;
  draggedIndex: number | null = null;
  dragIndexOver: number | null = null;
  pendingChanges: boolean = false;
  showAddOption: boolean = false;
  showDeleteConfirmationModal: boolean = false;
  showDeleteElement: boolean = false;
  idStandardAttribute: number;
  orderInDescription: number;
  attributeName: string = '';
  attributeOrderInDescription: number;
  groupedAttributes: StandardAttributes[] = [];
  selectedOption: StandardAttributeOption | null = null;
  selectedAttribute: StandardAttributes | null = null;
  showEditElementModal: boolean;
  synonyms: Synonym[] = []; // Para almacenar la lista de sinónimos
  selectedSynonym: Synonym | null = null; // Para el sinónimo que se va a editar o eliminar
  showDeleteSynonymModal: boolean = false; // Para controlar el modal de eliminación de sinónimos
  elementImage: string | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;

  constructor(private catalogService: CatalogManagementService) {}

  openAddAttribute(attribute: StandardAttributes | null = null) {
    this.selectedAttribute = attribute;
    this.showModal = true;
    if (!this.hasValidAttributes()) {
      this.orderInDescription = 0;
    }
  }

  isQAQCUser(): boolean {
    return this.idBusinessLineUser === 7;
  }

  closeAddAttributes() {
    this.showModal = false;
  }

  openAddOption(idStandardAttribute: number, option: StandardAttributeOption | null = null) {
    this.idStandardAttribute = idStandardAttribute;
    this.selectedOption = option;
    this.showAddOption = true;
  }

  openDeleteConfirmationModal(
    idStandardAttribute: number,
    attribute_name: string,
    attributeOrderInDescription: number
  ): void {
    this.idStandardAttribute = idStandardAttribute;
    this.attributeName = attribute_name;
    this.attributeOrderInDescription = attributeOrderInDescription;
    this.showDeleteConfirmationModal = true;
  }

  closeDeleteConfirmationModal() {
    this.showDeleteConfirmationModal = false;
  }

  openDeleteElement(): void {
    this.showDeleteElement = true;
  }

  closeDeleteElement() {
    this.showDeleteElement = false;
  }

  openEditElement() {
    this.showEditElementModal = true;
  }

  closeEditElement() {
    this.showEditElementModal = false;
  }

  ngOnInit() {
    this.loadSynonyms();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['elementGroup']) {
      this.updateLocalGroupedAttributes();
      this.loadSynonyms();
      this.imagePreview = null;
      const firstElement = this.elementGroup.elementos?.[0];

      if (firstElement?.image) {
        const buffer = firstElement.image.data;
        const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        this.elementImage = `data:image/png;base64,${base64String}`;
      } else {
        this.elementImage = null;
      }
    }
  }

  loadSynonyms() {
    if (!this.idStandardElement) {
      this.synonyms = [];
      return;
    }

    this.catalogService.getSynonymsForElement(this.idStandardElement).subscribe({
      next: res => {
        this.synonyms = res || [];
      },
      error: err => {
        console.error('Error al cargar los sinónimos:', err);
        this.synonyms = [];
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.processImageFile(file);
  }

  private processImageFile(file: File): void {
    if (file.type !== 'image/png') {
      alert('Error: Solo se permiten imágenes en formato PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Normalizar a 64x64 si es necesario
        if (img.width > 64 || img.height > 64) {
          this.resizeImage(img, 64, 64);
        } else {
          this.imagePreview = e.target.result;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private resizeImage(image: HTMLImageElement, width: number, height: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, width, height);
    this.imagePreview = canvas.toDataURL('image/png');
  }

  saveImage(): void {
    if (!this.imagePreview || !this.idStandardElement) {
      return;
    }
    this.isUploading = true;
    const base64Data = this.imagePreview.split(',')[1];

    this.catalogService
      .addOrUpdateStandardElementImage(this.idStandardElement, base64Data)
      .subscribe({
        next: () => {
          this.elementImage = this.imagePreview;
          this.imagePreview = null;
          this.isUploading = false;
          this.updateElements.emit();
        },
        error: (err: any) => {
          console.error('Error al guardar la imagen:', err);
          alert('Hubo un error al guardar la imagen.');
          this.isUploading = false;
        },
      });
  }

  cancelImageUpload(): void {
    this.imagePreview = null;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  deleteImage(): void {
    if (!this.idStandardElement || !confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }
    this.catalogService.deleteStandardElementImage(this.idStandardElement).subscribe({
      next: () => {
        this.elementImage = null;
        this.imagePreview = null;
        this.updateElements.emit();
      },
      error: (err: any) => {
        console.error('Error al eliminar la imagen:', err);
        alert('Hubo un error al eliminar la imagen.');
      },
    });
  }

  downloadImage(): void {
    if (!this.elementImage) return;
    const link = document.createElement('a');
    link.href = this.elementImage;
    link.download = `${this.elementGroup.name || 'element'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private updateLocalGroupedAttributes() {
    if (this.elementGroup && this.elementGroup.elementos) {
      this.groupedAttributes = this.groupedAttributesPorStandardAttribute;
    } else {
      this.groupedAttributes = []; // Si no hay elementGroup, vaciar la lista
    }
  }

  get groupedAttributesPorStandardAttribute(): StandardAttributes[] {
    if (!this.elementGroup || !this.elementGroup.elementos) {
      return [];
    }

    const mapa = new Map<number, Partial<StandardAttributes>>();

    for (const attr of this.elementGroup.elementos) {
      const id = attr.idStandardAttribute;

      const option: StandardAttributeOption = {
        option_id: attr.option_id,
        option_value: attr.option_value,
        option_verified: attr.option_verified,
      };

      if (!mapa.has(id)) {
        mapa.set(id, {
          id: attr.idStandardAttribute,
          name: attr.attribute_name,
          idStandardAttributeTypes: attr.idStandardAttributeTypes,
          required: attr.required,
          orderInDescription: attr.orderInDescription,
          idStandardElement: attr.id,
          alwaysShow: attr.alwaysShow,
          verified: attr.attribute_verified,
          useInGroupBy: attr.useInGroupBy,
          measurementUnit: attr.measurementUnit,
          showRunBES: attr.showRunBES,
          options: attr.option_id ? [option] : [],
        });
      } else {
        const existente = mapa.get(id)!;
        if (!existente.options) {
          existente.options = [];
        }
        if (attr.option_id) {
          existente.options.push(option);
        }
      }
    }

    this.orderInDescription = mapa.size;

    return Array.from(mapa.values()).sort(
      (a, b) => (a.orderInDescription ?? 0) - (b.orderInDescription ?? 0)
    ) as StandardAttributes[];
  }

  closeAddOption() {
    this.showAddOption = false;
  }

  manageElementSynonyms() {
    if (this.idStandardElement) {
      this.selectedSynonym = null; // Limpiar selección previa
      this.showAddSynonymsModal = true;
    }
  }

  openEditSynonym(synonym: Synonym) {
    this.selectedSynonym = synonym;
    this.showAddSynonymsModal = true;
  }

  closeAddSynonymsModal() {
    this.showAddSynonymsModal = false;
    this.selectedSynonym = null;
  }

  onSynonymModified() {
    this.closeAddSynonymsModal();
    this.loadSynonyms(); // Recarga la lista de sinónimos
    this.updateElements.emit(); // Opcional, si necesita refrescar el elemento padre
  }

  openDeleteSynonymModal(synonym: Synonym) {
    this.selectedSynonym = synonym;
    this.showDeleteSynonymModal = true;
  }

  closeDeleteSynonymModal() {
    this.showDeleteSynonymModal = false;
    this.selectedSynonym = null;
  }

  onSynonymDeleted() {
    this.closeDeleteSynonymModal();
    this.loadSynonyms(); // Recarga la lista de sinónimos
    this.updateElements.emit(); // Opcional
  }

  onSynonymAdded() {
    this.closeAddSynonymsModal();
  }

  hasValidAttributes(): boolean {
    return (
      Array.isArray(this.elementGroup?.elementos) &&
      this.elementGroup.elementos.some(attr => attr?.attribute_name)
    );
  }

  reloadAttributeList() {
    this.closeAddAttributes();
    this.closeDeleteConfirmationModal();
    this.updateElements.emit();
  }

  toggleEditPosition() {
    if (this.disabledAll) {
      return;
    }
    this.editPosition = !this.editPosition;
    if (!this.editPosition) {
      this.pendingChanges = false;
      this.reloadAttributeList();
    }
  }

  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    this.dragIndexOver = null;
  }

  onDragOver(event: DragEvent, index: number) {
    if (this.draggedIndex === null || this.draggedIndex === index) {
      return;
    }
    event.preventDefault();
    this.dragIndexOver = index;
  }

  onDrop(event: DragEvent, dropIndex: number) {
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      return;
    }

    const draggedItem = this.groupedAttributes[this.draggedIndex];
    this.groupedAttributes.splice(this.draggedIndex, 1);
    this.groupedAttributes.splice(dropIndex, 0, draggedItem);

    this.rebuildElementGroupElements();
    this.pendingChanges = true;
    this.draggedIndex = null;
    this.dragIndexOver = null;
  }

  rebuildElementGroupElements() {
    const nuevosElementos: StandardElement[] = [];
    let orderCounter = 1;

    for (const grupo of this.groupedAttributes) {
      const opciones = this.elementGroup.elementos.filter(
        el => el.idStandardAttribute === grupo.id
      );

      opciones.forEach(opcion => {
        opcion.orderInDescription = orderCounter;
        nuevosElementos.push(opcion);
      });

      orderCounter++;
    }

    this.elementGroup.elementos = nuevosElementos;
  }

  saveChanges() {
    this.pendingChanges = false;

    const attributesToUpdate = this.elementGroup.elementos.map((elemento: StandardElement) => ({
      name: elemento.attribute_name,
      idStandardElement: elemento.id,
      orderInDescription: elemento.orderInDescription,
    }));

    this.catalogService.editStandardAttributes(attributesToUpdate).subscribe({
      next: res => {
        this.pendingChanges = false;
        this.editPosition = false; // 🔴 Desactivar reordenamiento después de guardar
        this.updateElements.emit();
      },
      error: err => console.error('Error al actualizar el orden de los elementos:', err),
    });
  }
}
