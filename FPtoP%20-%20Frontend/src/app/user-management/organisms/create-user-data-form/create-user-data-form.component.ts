import { Component, Input, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BusinessLineService } from '../../../business-line/business-line.service';
import { UserManagementService } from '../../../user-management/services/user-management.service';
import { UserService } from 'src/app/features/auth/services/user.service';

export interface BusinessLine {
  key: number;
  value: string;
}

@Component({
  selector: 'app-create-user-data-form',
  templateUrl: './create-user-data-form.component.html',
  styleUrls: ['./create-user-data-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateUserDataFormComponent implements OnInit {
  @Input() firstName!: string;
  @Input() surName!: string;
  @Input() email!: string;
  @Input() microsoftId!: string;
  formulario: FormGroup = new FormGroup({
    firstName: new FormControl(this.firstName),
    surName: new FormControl(this.surName),
    email: new FormControl(this.email),
    microsoftId: new FormControl(this.microsoftId),
    businessLineID: new FormControl(null),
  });

  businessLines: BusinessLine[] = [];

  constructor(
    private businessLineService: BusinessLineService,
    private userManagementService: UserManagementService,
    private userService: UserService
  ) {
    console.log('BusinessLineService:', this.businessLineService);
    console.log('getAll method:', this.businessLineService.getAll);
  }

  loadBusinessLines(): void {
    this.businessLineService.getAll().subscribe({
      next: data => {
        console.log('data');
        console.log(data);
        data = data.data;
        let tempArray = [];
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          let objTemp = {
            key: element.id,
            value: element.name,
          };
          tempArray.push(objTemp);
        }
        this.businessLines = tempArray;
        console.log('this.businessLines');
        console.log(this.businessLines);
      },
      error: err => {
        console.error('Error cargando las líneas de negocio:', err);
      },
    });
  }

  sendData() {
    const obj = {
      idBusinessLine: this.formulario.value.businessLineID,
      email: this.formulario.value.email,
      firstName: this.formulario.value.firstName,
      lastName: this.formulario.value.surName,
      microsoftid: this.formulario.value.microsoftId,
    };
    this.userManagementService.create(obj).subscribe({
      next: data => {
        const dataUser = {
          idUser: data.idStored,
        };
        this.userManagementService.getByID(dataUser).subscribe({
          next: data => {
            const userInformation = data.data[0];
            this.userService.saveUserInfo(userInformation);
          },
          error: err => {
            console.error('Error al obtener informacion del usuario:', err);
          },
        });
      },
      error: err => {
        console.error('Error guardando el usuario:', err);
      },
    });
  }

  ngOnInit(): void {
    this.loadBusinessLines();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firstName']) {
      this.formulario.get('firstName')?.setValue(this.firstName);
    }
    if (changes['surName']) {
      this.formulario.get('surName')?.setValue(this.surName);
    }
    if (changes['email']) {
      this.formulario.get('email')?.setValue(this.email.toLowerCase());
    }
    if (changes['microsoftId']) {
      this.formulario.get('microsoftId')?.setValue(this.microsoftId);
    }
  }

  submitForm() {
    this.onSubmit(); // Llamar manualmente al submit cuando `app-button` sea clickeado
  }

  onSubmit() {
    console.log('Datos del formulario:', this.formulario.value);
    this.sendData();
  }

  get firstNameControl(): FormControl {
    return (this.formulario.get('firstName') as FormControl) || new FormControl('');
  }

  get surNameControl(): FormControl {
    return (this.formulario.get('surName') as FormControl) || new FormControl('');
  }
  get emailControl(): FormControl {
    return (this.formulario.get('email') as FormControl) || new FormControl('');
  }
  get microsoftIdControl(): FormControl {
    return (this.formulario.get('microsoftId') as FormControl) || new FormControl('');
  }
  get businessLineIDControl(): FormControl {
    return (this.formulario.get('businessLineID') as FormControl) || new FormControl('');
  }
}
