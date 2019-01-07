import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GenerateLogService } from './services/generate-log.service';
import { VscodeMessageService } from './services/vscode-message.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    providers: [
        GenerateLogService,
        VscodeMessageService
    ],
    exports:[],
    entryComponents:[]
})
export class CoreModule { }
