import { Component, OnDestroy, OnInit } from '@angular/core';
import { IVscodeOption, LogItem, SipRenderFormItem } from '../core/base';
import { GenerateLogService } from '../core/services/generate-log.service';
import { VscodeMessageService } from '../core/services/vscode-message.service';

@Component({
  selector: 'sip-generate-log',
  templateUrl: './generate-log.component.html'
})
export class GenerateLogComponent implements OnInit, OnDestroy {

  constructor(private _vsMsg: VscodeMessageService,
    private genSrv: GenerateLogService) {
    this.vscodeOptions = _vsMsg.options;
    let generateOpt = this.vscodeOptions.generate;
    if (generateOpt) {
      this._vsMsg.input = generateOpt.input || 'demo';
      document.addEventListener('keydown', this.keydown);
    }
    this.genSrv.onEnd = () => {
      setTimeout(function(){ window.scrollTo(0, 1000000);}, 50);
    }
  }

  keydown = (e) => {
    switch (e.keyCode) {
      case 13:
      case 27:
        e.stopPropagation();
        e.preventDefault();
        this.close();
        return false;

    }
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keydown)
  }

  vscodeOptions: IVscodeOption;
  get generating(): number {
    return this.genSrv.generating;
  }

  set generating(p: number) {
    this.genSrv.generating = p;
  }

  get forms(): SipRenderFormItem[] {
    return this.genSrv.forms;
  }

  get hasForm() {
    let forms = this.forms;
    return forms && forms.length > 0;
  }

  close() {
    if (this.genSrv.generateFirstFile) {
      this._vsMsg.openFileEx(this.genSrv.generateFirstFile).subscribe();
    }
    this._vsMsg.close();
  }

  isStart = false;
  start() {
    this.isStart = true;
    this.genSrv.start();
  }

  ngOnInit() {
    this.hasForm || this.start();
  }

  get genReports(): LogItem[] {
    return this.genSrv.genReports;
  }

}
