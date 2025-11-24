import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatFormFieldModule,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from '@angular/material/form-field';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
} from '@angular/material-moment-adapter';
import { MatCheckboxModule, MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';

import { SlbNavigationFrameworkModule } from '@slb-dls/angular-material/navigation-framework';
import { SlbSharedModule } from '@slb-dls/angular-material/shared';
import { SlbNotificationModule, MessageService } from '@slb-dls/angular-material/notification';
import { SlbNotificationsPanelModule } from '@slb-dls/angular-material/notifications-panel';
import { SlbLogoutModule } from '@slb-dls/angular-material/logout';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbBreadcrumbsModule } from '@slb-dls/angular-material/breadcrumbs';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SLB_MOMENT_DATE_FORMATS, SLB_THEMING_OPTIONS } from '@slb-dls/angular-material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ThemeSwitcherComponent } from './theme-switcher/theme-switcher.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { themeConfig } from '../themes/theme.config';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomShayaHeaderComponent } from './atoms/custom-shaya-header/custom-shaya-header.component';
import { SlbDropzoneModule } from '@slb-dls/angular-material/dropzone';
import { SlbDropdownModule } from '@slb-dls/angular-material/dropdown';
//import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfViewerDialogComponent } from './organisms/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { ToastComponent } from './atoms/toast/toast.component';
import { ActivePipesComponent } from './pages/active-pipes/active-pipes.component';
import { SlbSearchModule } from '@slb-dls/angular-material/search';
import { SlbDatePickerRangeModule } from '@slb-dls/angular-material/date-range-picker';
import { MatCardModule } from '@angular/material/card';
import { CustomCardComponent } from './organisms/custom-card/custom-card.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';
import { ButtonRarUploadComponent } from './atoms/button-rar-upload/button-rar-upload.component';
import { LoadRarFilesComponent } from './organisms/load-rar-files/load-rar-files.component';
import { RarFilesModalDialogComponent } from './atoms/rar-files-modal-dialog/rar-files-modal-dialog.component';
import { ShowValidSignsComponent } from './atoms/show-valid-signs/show-valid-signs.component';
import { AddWellInformationScreenComponent } from './pages/wells-screen/add-well-information-screen/add-well-information-screen.component';
import { WellInformationScreenComponent } from './pages/wells-screen/well-information-screen/well-information-screen.component';
import { UploadWellSupportDocumentsComponent } from './pages/wells-screen/upload-well-support-documents/upload-well-support-documents.component';
import { ErrorProcessingWellInformationComponent } from './pages/wells-screen/error-processing-well-information/error-processing-well-information.component';
import { WellTableInformationComponent } from './organisms/well-table-information/well-table-information.component';
import { AuthInterceptor } from './auth.interceptor';
import { ElementHandlingComponent } from './organisms/element-handling/element-handling.component';
//FE field module
import { DynamicTableComponent } from './pages/field/organism/dynamic-table/dynamic-table.component';
import { DynamicTableComponent01 } from './pages/field/organism/field-dynamic-content/field-step-01/dynamic-table_01/dynamic-table_01.component';
import { DynamicTableComponent03 } from './pages/field/organism/field-dynamic-content/field-step-03/dynamic-table_03/dynamic-table_03.component';
import { DynamicTableComponent03r } from './pages/field/organism/field-dynamic-content/field-step-03/dynamic-table_03_r/dynamic-table_03_r.component';
import { DynamicTableComponent02 } from './pages/field/organism/field-dynamic-content/field-step-02/dynamic-table_02/dynamic-table_02.component';
import { DynamicTableComponent04 } from './pages/field/organism/field-dynamic-content/field-step-04/dynamic-table_04/dynamic-table_04.component';
import { DynamicTableComponent05 } from './pages/field/organism/field-dynamic-content/field-step-05/dynamic-table_05/dynamic-table_05.component';
import { FieldHomeComponent } from './pages/field/home/field-home.component';

import { FieldComponent } from './pages/field/field.component';
import { FieldActivationRequestComponent } from './pages/field/activation-request/field-activation-request.component';

import { FieldDynamicContentComponent } from './pages/field/organism/field-dynamic-content/field-dynamic-content.component';
import { DynamicStepperComponent } from './organisms/dynamic-stepper/dynamic-stepper.component';
import { FieldDynamicStepperComponent } from './pages/field/atoms/dynamic-stepper/dynamic-stepper.component';

import { FieldStepOneComponent } from './pages/field/organism/field-dynamic-content/field-step-01/field-step-01.component';
import { FieldStepTwoComponent } from './pages/field/organism/field-dynamic-content/field-step-02/field-step-02.component';
import { FieldStepThreeComponent } from './pages/field/organism/field-dynamic-content/field-step-03/field-step-03.component';
import { FieldStepFourComponent } from './pages/field/organism/field-dynamic-content/field-step-04/field-step-04.component';
import { FieldStepFiveComponent } from './pages/field/organism/field-dynamic-content/field-step-05/field-step-05.component';
import { FieldStepSixComponent } from './pages/field/organism/field-dynamic-content/field-step-06/field-step-06.component';
import { FieldStepSevenComponent } from './pages/field/organism/field-dynamic-content/field-step-07/field-step-07.component';

import { CustomShayaHeaderComponentGreenSheen } from './atoms/custom-shaya-header-greenSheen/custom-shaya-header-greenSheen.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GenericRequestPageComponent } from './pages/field/generic-request-page/generic-request-page.component';
import { ButtonRedComponent } from './atoms/button-red/button-red.component';
import { FieldButtonComponent } from './pages/field/atoms/button/button.component';

import { FieldFileUploadComponent } from './pages/field/atoms/file-upload/file-upload.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

//FE field module
import { SignsPopoverComponent } from './organisms/signs-popover/signs-popover.component';
import { PendingChecksScreenComponent } from './pages/quality/pending-checks-screen/pending-checks-screen.component';
import { CheckInformationComponent } from './pages/quality/approve/check-information/check-information.component';
import { AddSignFilesComponent } from './pages/quality/approve/add-sign-files/add-sign-files.component';
import { ApproveScreenComponent } from './pages/quality/approve/approve-screen/approve-screen.component';
import { LoadRejectDialogComponent } from './organisms/load-reject-dialog/load-reject-dialog.component';
import { DoubleAskDialogComponent } from './atoms/double-ask-dialog/double-ask-dialog.component';
import { LoadDoubleAskDialogComponent } from './organisms/load-double-ask-dialog/load-double-ask-dialog.component';
import { RejectedWellSentInformationComponent } from './pages/quality/rejected-approved-screens/rejected-well-sent-information/rejected-well-sent-information.component';
import { RejectApproveCardComponent } from './organisms/reject-approve-card/reject-approve-card.component';
import { ApprovedWellSentInformationComponent } from './pages/quality/rejected-approved-screens/approved-well-sent-information/approved-well-sent-information.component';
import { SendToPECComponent } from './pages/quality/pending-PEC/send-to-pec/send-to-pec.component';
import { UploadSignFilesComponent } from './pages/quality/pending-PEC/upload-sign-files/upload-sign-files.component';
import { ApprovedByQualityComponent } from './pages/segment/approved-by-quality/approved-by-quality.component';
import { ApprovedByPecComponent } from './pages/segment/approved-by-pec/approved-by-pec.component';
import { PecModule } from './features/pec/pec.module';
import { QaqcModule } from './features/qaqc/qaqc.module';
import { QaqcService } from './features/qaqc/services/qaqc.service';
import { ShowQaqcApprovedRejectedInformationComponent } from './pages/quality/rejected-approved-screens/show-qaqc-approved-rejected-information/show-qaqc-approved-rejected-information.component';
import { ShowElementsInformationComponent } from './pages/quality/rejected-approved-screens/show-elements-information/show-elements-information.component';
import { ShowSignsInformationComponent } from './pages/quality/rejected-approved-screens/show-signs-information/show-signs-information.component';
import { SharedModule } from './shared/shared.module';
import { WellsModule } from './features/wells/wells.module';
import { AccessDeniedComponent } from './shared/components/templates/access-denied/access-denied.component';
import { DashboardPageComponent } from './shared/pages/dashboard-page/dashboard-page.component';
import { UploadDataSummaryComponentComponent } from './shared/components/organism/upload-data-summary-component/upload-data-summary-component.component';
import { DialogAdviceComponent } from './shared/components/organism/dialog-advice/dialog-advice.component';
import { SupportDocumentListComponent } from './shared/components/organism/support-document-list/support-document-list.component';
import { CheckOilFieldOperationComponent } from './shared/pages/check-oil-field-operation/check-oil-field-operation.component';
import { OilFieldOperationDataComponent } from './shared/pages/check-oil-field-operation/oil-field-operation-data/oil-field-operation-data.component';
import { OilFieldOperationSignsComponent } from './shared/pages/check-oil-field-operation/oil-field-operation-signs/oil-field-operation-signs.component';
import { TallySheetListTestDataComponent } from './molecules/tally-sheet-list-test-data/tally-sheet-list-test-data.component';
import { RequestInterceptorsInterceptor } from './core/interceptors/request-interceptors.interceptor';
import { NotificationBadgeComponent } from './shared/components/atoms/notification-badge/notification-badge.component';
import { CustomShayaHeaderIconComponent } from './atoms/custom-shaya-header-icon/custom-shaya-header-icon.component';
import { AppFieldRunBesComponent } from './pages/field/organism/field-dynamic-content/field-run-bes/field-run-bes.component';
import { CustomShayaHeaderBlueSmallComponent } from './atoms/custom-shaya-header-blue-small/custom-shaya-header-blue-small.component';
import { MaterialModule } from './core/modules/material.module';
import { QAQCReviewComponent } from './pages/releases/qaqcReview/qaqc-review.component';
import { ReviewComponent } from './pages/releases/review/review.component';
import { ShowItemsComponent } from './molecules/show-items/show-items.component';
import { SearchByTextComponent } from './molecules/search-by-text/search-by-text-component';
import { SearchByDateComponent } from './molecules/search-by-date/search-by-date.component';
import { HeaderReleaseComponent } from './molecules/header-release/header-release.component';
import { ItemsOfReleaseComponent } from './organisms/items-of-release/items-of-release.component';
import { DraftComponent } from './pages/releases/draft/draft.component';
import { PECReviewComponent } from './pages/releases/pecReview/pec-review.component';
import { ApprovedComponent } from './pages/releases/approved/approved.component';
import { MatSelectModule } from '@angular/material/select';
import { SLBModule } from './core/modules/slb.module';
import { SignsModule } from './features/signs/signs.module';
import { SupportComponent } from './pages/releases/support/support.component';
import { ActiveComponent } from './pages/releases/active/active.component';
import { CustomActiveCardComponent } from './organisms/custom-active-card/custom-active-card.component';
import { ActiveWellsComponent } from './pages/wells-screen/active-wells/active-wells.component';
import { ShowActiveItemsComponent } from './molecules/show-active-items/show-active-items.component';
import { HistoryReleaseComponent } from './pages/releases/history/history.component';
import { AppDocumentsActiveComponent } from './pages/releases/documents-active/documents-active.component';

import { CreateUserComponent } from './user-management/pages/create-user/create-user.component';
import { CreateUserDataFormComponent } from './user-management/organisms/create-user-data-form/create-user-data-form.component';
import { InputComponent } from './atoms/input/input.component';
import { SelectComponent } from './atoms/select/select.component';
import { ObtainDataUserComponent } from './user-management/pages/obtain-data-user/obtain-data-user.component';
import { TestButtonUploadComponent } from './internalTests/button-upload/button-upload.component';

import { ButtonUploadComponent } from './atoms/button-upload/button-upload.component';
import { EditListOfFilesComponent } from './organisms/list-of-files/edit-list-of-files/edit-list-of-files.component';
import { ShowListOfFilesComponent } from './organisms/list-of-files/show-list-of-files/show-list-of-files.component';
import { ButtonSignsComponent } from './organisms/list-of-files/button-signs/button-signs.component';
import { ButtonPreviewPDFComponent } from './organisms/list-of-files/button-preview-pdf/button-preview-pdf.component';
import { ButtonDownloadFileComponent } from './organisms/list-of-files/button-download-file/button-download-file.component';
import { ButtonDeleteFileComponent } from './organisms/list-of-files/button-delete-file/button-delete-file.component';
import { ButtonDeleteSelectedComponent } from './organisms/list-of-files/button-delete-selected/button-delete-selected.component';
import { ProgressUploadComponent } from './organisms/list-of-files/progress-upload/progress-upload.component';
import { ListElementComponent } from './organisms/element-handling/list-element/list-element.component';
import { ShowIdBusinessLineComponent } from './molecules/show-id-business-line/show-id-business-line.component';
import { AddElementComponent } from './organisms/element-handling/add-element/add-element.component';
import { ShowIdStandardWellSectionsComponent } from './molecules/show-idStandard-WellSections/show-idStandard-WellSections.component';
import { ShowIdStandardWellInfrastructureTypeComponent } from './molecules/show-idStandardWell-InfrastructureType/show-idStandardWell-InfrastructureType.component';
import { ElementAttributesComponent } from './organisms/element-handling/element-attributes/element-attributes.component';
import { AddAttributeComponent } from './organisms/element-handling/add-attribute/add-attribute.component';
import { ShowStandardAttributeTypes } from './molecules/show-StandardAttributeTypes/show-StandardAttributeTypes.component';
import { SignatureBoxComponent } from './atoms/signature-box/signature-box.component';
import { AttributeOptionsComponent } from './organisms/element-handling/attribute-options/attribute-options.component';
import { SearchBarComponent } from './organisms/element-handling/search-bar.component/search-bar.component';
import { ViewAttributeOptionsComponent } from './organisms/element-handling/attribute-options/view-attribute-options/view-attribute-options.component';
import { ConfirmOptionsToBeDeletedComponent } from './organisms/element-handling/attribute-options/confirm-options-to-be-deleted/confirm-options-to-be-deleted.component';
import { AddSynonymsComponent } from './organisms/element-handling/add-synonyms/add-synonyms.component';
import { ConfirmAttributeToBeDeletedComponent } from './organisms/element-handling/element-attributes/confirm-attribute-to-be-deleted/confirm-attribute-to-be-deleted.component';
import { ConfirmElementToBeDeletedComponent } from './organisms/element-handling/add-element/confirm-element-to-be-deleted/confirm-element-to-be-deleted.component';
import { DateCustomFormatFromAvocetPipe } from './pipes/date-custom-format-from-avocet.pipe';
import { MissingSignaturesWarningComponent } from './atoms/missing-signatures-warning/missing-signatures-warning.component';
import { ConfirmSynonymToBeDeletedComponent } from './organisms/element-handling/add-synonyms/confirm-synonyms-to-be-deleted/confirm-synonym-to-be-deleted.component';
import { loadDescriptionComponent } from './molecules/validate-element-ITP/load-description/load-description.component';
import { ValidateDescriptionComponent } from './molecules/validate-element-ITP/validate-description-ITP/validate-description.component';
import { SignerDialogComponent } from './features/signs/components/molecules/signer-dialog/signer-dialog.component';
import { SignerCertificateComponent } from './features/signs/components/molecules/signer-certificate/signer-certificate.component';
import { SignsHomePageComponent } from './features/signs/pages/signs-home-page/signs-home-page.component';
import { SignDocumentComponent } from './features/signs/components/organisms/sign-document/sign-document.component';
import { SignDocumentPageTestComponent } from './features/signs/components/pages/sign-document-page-test/sign-document-page-test.component';
import { GlobalZipModalDialogComponent } from './atoms/global-zip-modal-dialog/global-zip-modal-dialog.component';
import { ReleaseTypeSelectorComponent } from './pages/wells-screen/release-type-selector/release-type-selector.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ErrorLogger } from './error-logger';
import { ErrorHandler } from '@angular/core';
import { HttpErrorInterceptor } from './http-error.interceptor';

const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline',
};

const defaultColor = {
  color: 'primary',
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ThemeSwitcherComponent,
    NotificationsComponent,
    CustomShayaHeaderComponent,
    ButtonUploadComponent,
    PdfViewerDialogComponent,
    ToastComponent,
    ActivePipesComponent,
    UploadDataSummaryComponentComponent,

    CustomCardComponent,
    CustomActiveCardComponent,
    ButtonRarUploadComponent,
    LoadRarFilesComponent,
    RarFilesModalDialogComponent,
    AddWellInformationScreenComponent,
    WellInformationScreenComponent,
    UploadWellSupportDocumentsComponent,
    ErrorProcessingWellInformationComponent,
    WellTableInformationComponent,
    ElementHandlingComponent,
    //FE field module
    FieldHomeComponent,
    ActiveWellsComponent,
    FieldComponent,
    FieldActivationRequestComponent,
    DynamicTableComponent,
    DynamicTableComponent01,
    DynamicTableComponent02,
    DynamicTableComponent03,
    DynamicTableComponent03r,
    DynamicTableComponent04,
    DynamicTableComponent05,
    FieldDynamicContentComponent,
    DynamicStepperComponent,
    FieldDynamicStepperComponent,
    FieldStepOneComponent,
    FieldStepTwoComponent,
    FieldStepThreeComponent,
    FieldStepFourComponent,
    FieldStepFiveComponent,
    FieldStepSixComponent,
    FieldStepSevenComponent,
    CustomShayaHeaderComponentGreenSheen,
    DynamicTableComponent,
    GenericRequestPageComponent,
    ButtonRedComponent,
    FieldButtonComponent,
    FieldFileUploadComponent,

    //FE field module
    SignsPopoverComponent,
    PendingChecksScreenComponent,
    CheckInformationComponent,
    AddSignFilesComponent,
    ApproveScreenComponent,
    LoadRejectDialogComponent,
    DoubleAskDialogComponent,
    LoadDoubleAskDialogComponent,
    RejectedWellSentInformationComponent,
    RejectApproveCardComponent,
    ApprovedWellSentInformationComponent,
    SendToPECComponent,
    UploadSignFilesComponent,
    ApprovedByQualityComponent,
    ApprovedByPecComponent,
    ShowQaqcApprovedRejectedInformationComponent,
    ShowElementsInformationComponent,
    ShowSignsInformationComponent,
    AccessDeniedComponent,
    DashboardPageComponent,
    DialogAdviceComponent,
    SupportDocumentListComponent,
    CheckOilFieldOperationComponent,
    OilFieldOperationDataComponent,
    OilFieldOperationSignsComponent,
    TallySheetListTestDataComponent,
    NotificationBadgeComponent,
    CustomShayaHeaderIconComponent,
    AppFieldRunBesComponent,
    CustomShayaHeaderBlueSmallComponent,
    QAQCReviewComponent,
    ShowItemsComponent,
    ShowActiveItemsComponent,
    SearchByTextComponent,
    SearchByDateComponent,
    HeaderReleaseComponent,
    ItemsOfReleaseComponent,
    DraftComponent,
    PECReviewComponent,
    ApprovedComponent,
    ReviewComponent,
    SupportComponent,
    ActiveComponent,
    HistoryReleaseComponent,
    AppDocumentsActiveComponent,
    CreateUserComponent,
    CreateUserDataFormComponent,
    InputComponent,
    SelectComponent,
    ObtainDataUserComponent,
    TestButtonUploadComponent,
    EditListOfFilesComponent,
    ShowListOfFilesComponent,
    ButtonSignsComponent,
    ButtonPreviewPDFComponent,
    ButtonDownloadFileComponent,
    ButtonDeleteFileComponent,
    ButtonDeleteSelectedComponent,
    ProgressUploadComponent,
    ShowIdBusinessLineComponent,
    ShowIdStandardWellSectionsComponent,
    ShowIdStandardWellInfrastructureTypeComponent,
    ListElementComponent,
    AddElementComponent,
    AddAttributeComponent,
    ElementAttributesComponent,
    ShowStandardAttributeTypes,
    SignatureBoxComponent,
    AttributeOptionsComponent,
    SearchBarComponent,
    ViewAttributeOptionsComponent,
    ConfirmOptionsToBeDeletedComponent,
    AddSynonymsComponent,
    ConfirmAttributeToBeDeletedComponent,
    ConfirmElementToBeDeletedComponent,
    DateCustomFormatFromAvocetPipe,
    MissingSignaturesWarningComponent,
    ConfirmSynonymToBeDeletedComponent,
    loadDescriptionComponent,
    ValidateDescriptionComponent,
    SignerDialogComponent,
    SignDocumentComponent,
    SignDocumentPageTestComponent,
    SignsHomePageComponent,
    //SignerDialogComponent,
    SignerCertificateComponent,
    GlobalZipModalDialogComponent,
    ReleaseTypeSelectorComponent,
    PrivacyComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatMomentDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MaterialModule,
    MatCardModule,
    MatSelectModule,

    SlbSharedModule,
    SlbButtonModule,
    SlbFormFieldModule,
    SlbPopoverModule,
    SlbNotificationModule,
    SlbNotificationsPanelModule,
    SlbNavigationFrameworkModule,
    SlbBreadcrumbsModule,
    SlbLogoutModule,
    MatStepperModule,
    SlbDropzoneModule,
    SlbDropdownModule,
    SLBModule,
    //Component,
    AgGridAngular,
    PdfViewerModule,
    SlbSearchModule,
    SlbDatePickerRangeModule,
    MatCardModule,
    SharedModule,
    QaqcModule,
    //////// field module///////
    DragDropModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    WellsModule,
    ////////////////////////////
    SignsModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: ErrorLogger },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: SLB_THEMING_OPTIONS, useValue: themeConfig },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: appearance },
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: defaultColor },
    { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: defaultColor },
    { provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MessageService, useClass: MessageService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorsInterceptor, multi: true },

    LoadingService,
    QaqcService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
