import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
    @Input() selectedGroup: boolean = false;
    @Output() searchTermChanged = new EventEmitter<string>();
    @Output() searchIconClick = new EventEmitter<void>();

    searchControl = new FormControl('');

    ngOnInit() {
        this.searchControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(term => {
            if (typeof term === 'string') {
            this.searchTermChanged.emit(term.trim());
            }
        });
    }

    onClick() {
        this.searchIconClick.emit();
    }

    resetSearch() {
        this.searchControl.setValue('');
    }
}
