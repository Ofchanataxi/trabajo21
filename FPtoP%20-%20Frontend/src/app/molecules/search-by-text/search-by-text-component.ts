import {
    Input,
    Component,
    Output,
    EventEmitter
} from "@angular/core";

@Component({
  selector: 'search-by-text',
  templateUrl: './search-by-text-component.html',
  styleUrls: ['./search-by-text-component.scss'],
})
export class SearchByTextComponent {
  @Input() originalItems!: any;
  @Output() itemsChange = new EventEmitter();
  onSearchChange(textToSearch: string): void {
    const tempTextToSearch = textToSearch ? textToSearch.toLowerCase() : '';
    if (!tempTextToSearch) {
      this.itemsChange.emit(this.originalItems);
      return;
    }

    const filteredData = this.originalItems.filter((item: any) => {
      const wellNameMatch = item.wellName && item.wellName.toLowerCase().includes(tempTextToSearch);
      const wellShortNameMatch =
        item.wellShortName && item.wellShortName.toLowerCase().includes(tempTextToSearch);
      const rigNameMatch = item.rigName && item.rigName.toLowerCase().includes(tempTextToSearch);
      const opCodeMatch =
        item.operationCode && item.operationCode.toLowerCase().includes(tempTextToSearch);
      const opNumberMatch =
        item.operationNumber && String(item.operationNumber).includes(tempTextToSearch);
      const idOilfieldMatch =
        item.idOilfieldOperations && String(item.idOilfieldOperations).toLowerCase().includes(tempTextToSearch);


      const fullOpMatch =
        item.operationCode &&
        item.operationNumber &&
        (item.operationCode + ' ' + String(item.operationNumber))
          .toLowerCase()
          .includes(tempTextToSearch);


      return (
        wellNameMatch ||
        wellShortNameMatch ||
        rigNameMatch ||
        opCodeMatch ||
        opNumberMatch ||
        fullOpMatch ||
        idOilfieldMatch
      );
    });

    this.itemsChange.emit(filteredData);
  }

  onSearchClear(event: any) {
    console.log('event');
    console.log(event);
    this.itemsChange.emit(this.originalItems);
  }
}