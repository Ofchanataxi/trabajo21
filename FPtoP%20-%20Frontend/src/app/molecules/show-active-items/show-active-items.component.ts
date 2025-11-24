import {
    Input,
    Component,
    ChangeDetectorRef,
    inject,
    Output,
    EventEmitter
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MessageService} from "@slb-dls/angular-material/notification";
import { Subscription } from "rxjs";
import { DateCustomFormatPipe } from "src/app/atoms/date-custom-format.pipe";
import { UserInfo, UserService } from "src/app/features/auth/services/user.service";
import { LogisticService } from "src/app/features/logistic/services/logistic.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'show-active-items',
  templateUrl: './show-active-items.component.html',
  styleUrls: ['./show-active-items.component.scss'],
})
export class ShowActiveItemsComponent {
    public user : UserInfo;
    private userSerivce = inject(UserService);
    private userSuscription: Subscription;
    constructor(
    private router: Router,
    private dateCustomFormatPipe: DateCustomFormatPipe,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    ) {}

    documents: any;
    wellState: string;
    @Input() idRelease!: number;
    @Input() nameWell!: any;
    @Input() filteredItems: any;
    @Input() urlRedirect: any;
    @Output() documentItemSelected = new EventEmitter<any>();

    ngOnInit(): void {        
        this.userSuscription = this.userSerivce.currentUser.subscribe(currentUser => {
            this.user = currentUser;
            this.cdr.detectChanges(); // Forzar detección de cambios
        });
    }

    public cardConfig = [
        { title: 'Estado Operación:', valueKey: 'operation_state_name' },
        { title: 'Fecha de Inicio:', valueKey: 'startDate', pipe: 'dateCustomFormat' },
        { title: 'Fecha de Fin:', valueKey: 'endDateTime', pipe: 'dateCustomFormat' },
    ];

    getFormattedValue(card: any, data: any): string {
        const value = data[card.valueKey];
        if (value === null || value === undefined) {
          return 'N/A';
        }
        if (card.pipe === 'dateCustomFormat') {
          return this.dateCustomFormatPipe.transform(value);
        }
        return value;
    }

    toggleRunBES(idOilfieldOperations: any) {
        this.router.navigate(['/run-bes', idOilfieldOperations]);
    }
    
    toggleDocuments(item: any) {
        sessionStorage.setItem('selectedItem', JSON.stringify(item));
        this.router.navigate(['active/documents']);
    }
      
    toggleShowField(idOilfieldOperations: any) {
        const url = environment.frontEndpoints.field.field.url;
        this.router.navigate([url, idOilfieldOperations]);
    }
}
