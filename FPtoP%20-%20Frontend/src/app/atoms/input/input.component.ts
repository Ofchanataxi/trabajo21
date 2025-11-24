import { Component, EventEmitter, Input, Output, forwardRef, Self, Optional } from '@angular/core';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { ThemePalette } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent {
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showPrefix: boolean = false;
  @Input() prefix: string = '';
  @Input() showLabel: boolean = false;
  @Input() label: string = '';
  @Input() showSuffix: boolean = false;
  @Input() suffix: string = '';
  @Input() showHint: boolean = false;
  @Input() hint: string = '';

  @Input() size: string = 'large';
  color: ThemePalette = 'primary';
  //@Input() formControl: FormControl = new FormControl('');
  @Input() formControl!: FormControl;

  //@Output() valueChange = new EventEmitter<string>(); // Evento para el padre

  value: string = '';

  // constructor(@Self() @Optional() public ngControl: NgControl) {
  //   if (this.ngControl) {
  //     this.ngControl.valueAccessor = this;
  //   }
  // }

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value = inputValue;
    this.onChange(inputValue);
    this.onTouched();
  }

  getErrorMessage(): string {
    if (this.formControl?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    return '';
  }
}
