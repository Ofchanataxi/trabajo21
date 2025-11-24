import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { StandardAttributeOption } from '../../interfaces/interfaces.interfaces';

@Component({
  selector: 'app-view-attribute-options',
  templateUrl: './view-attribute-options.component.html',
  styleUrls: ['./view-attribute-options.component.scss'],
})
export class ViewAttributeOptionsComponent implements OnChanges {
  @Input() attributeName!: string;
  @Input() attributeOptions: StandardAttributeOption[] = [];
  @Input() isQAQCUser: boolean;
  @Input() idUser: number | null;
  @Input() disabledAll: boolean;
  @Output() updateOptions = new EventEmitter<void>();
  @Output() editOption = new EventEmitter<StandardAttributeOption>();

  showDeleteConfirmationModal: boolean = false;
  option_id: number;
  option_value: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attributeOptions'] && this.attributeOptions) {
      this.sortOptions();
    }
  }

  private sortOptions(): void {
    this.attributeOptions.sort((a, b) => {
      return String(a.option_value).localeCompare(String(b.option_value), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  openDeleteConfirmationModal(option_id: number, option_value: string): void {
    this.option_id = option_id;
    this.option_value = option_value;
    this.showDeleteConfirmationModal = true;
  }

  openEditForm(option: StandardAttributeOption): void {
    this.editOption.emit(option);
  }

  reloadOptionList() {
    this.showDeleteConfirmationModal = false;
    this.updateOptions.emit();
  }

  closeDeleteConfirmationModal() {
    this.showDeleteConfirmationModal = false;
  }
}
