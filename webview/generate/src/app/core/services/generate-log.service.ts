import { Injectable } from '@angular/core';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogItem, LogStyle, SipRenderInputItem, SipRenderOut, SipRenderTemplateItem } from '../base';
import { JoinPath } from '../lib';
import { SipRenderFile } from '../sip-render-file';
import { VscodeMessageService } from './vscode-message.service';


@Injectable()
export class GenerateLogService {

    inputs: SipRenderInputItem[] = [];
    templates: SipRenderTemplateItem[] = [];
    extendFn: any;
    tmplPath: string = '';
    isLinux: boolean = false;

    constructor(private _vsMsg: VscodeMessageService) {

    }

    start() {
        let options = this._vsMsg.options;
        this.isLinux = options.isLinux;
        this.tmplPath = options.tmplPath;

        SipRenderFile.logs.forEach((item) => {
            this.genReports.push(item);
        });

        let tmplIndex = this._vsMsg.options.tmplIndex;
        if (tmplIndex) {
            try {
                this.warning('解释index');
                this.log(tmplIndex);
                (new Function('SipRender', tmplIndex))({
                    inputs: (inputs) => {
                        this.inputs = inputs;
                    },
                    templates: (templates) => {
                        this.templates = templates;
                    },
                    extend: (fn) => {
                        this.extendFn = fn;
                    },
                    log(...args: string[]) {
                        return SipRenderFile.logOut(...args);
                    },
                    warning(...args: string[]) {
                        return SipRenderFile.warningOut(...args);
                    },
                    error(...args: string[]) {
                        return SipRenderFile.errorOut(...args);
                    }
                });
                this.loadTemplateContent().subscribe(() => {
                    this.generate();
                });
            } catch (e) {
                this.error(e.toString());
            }
        } else {
            this.error('没有index.js内容');
        }
    }

    joinPath(path) {
        return JoinPath(this.tmplPath, path, this.isLinux);
    }

    loadTemplateContent() {
        let loadList = [];
        let rxTemp = null;
        this.warning(`读取模板内容`);
        this.templates.forEach((item) => {
            rxTemp = this._vsMsg.readFileEx(this.joinPath(item.templateExtend)).pipe(map((content) => {
                this.log(`${item.templateExtend} 内容：${content}`);
                item.script = content;
            }));
            loadList.push(rxTemp);
            rxTemp = this._vsMsg.readFileEx(this.joinPath(item.templateFile)).pipe(map((content) => {
                this.log(`${item.templateFile} 内容：${content}`);
                item.content = content;
            }));
            loadList.push(rxTemp);
        });
        return zip(...loadList);
    }

    pushReport(style: LogStyle, args: string[]) {
        args.forEach((item) => {
            this.genReports.push({
                text: item,
                style: style
            });
        });
    }

    log(...args: string[]) {
        if (SipRenderFile.debug) {
            this.pushReport(LogStyle.info, args);
        }
    }

    warning(...args: string[]) {
        if (SipRenderFile.debug) {
            this.pushReport(LogStyle.warning, args);
        }
    }

    error(...args: string[]) {
        this.pushReport(LogStyle.error, args);
    }

    success(...args: string[]) {
        this.pushReport(LogStyle.success, args);
    }

    vscodeLog(str: string) {
        this._vsMsg.log(str).subscribe();
    }

    private rd = new SipRenderFile();
    genReports: LogItem[] = [];
    generating = 0;
    generateFirstFile: string;
    generate() {
        // this.genReports = [];
        this.generating = 1;
        let saveList: SipRenderOut[] = [];
        this.generateFirstFile = '';
        let input = this._vsMsg.input;
        let tmplName = this._vsMsg.options.tmplName;
        this.templates.forEach((template) => {
            this.warning(`render 文件：${template.templateExtend}`);
            let item = this.rd.render(template, this.extendFn, tmplName, input);
            item.logs.forEach((item) => {
                this.genReports.push(item);
            });
            saveList.push(item);
        });

        let outs = [];
        saveList.forEach((file) => {
            if (!file.dir) {
                this.generateFirstFile || (this.generateFirstFile = file.fullPath);
            }
            let rx = this._vsMsg.saveFileEx(file.fullPath, file.content, 'w', file.dir).pipe(map((res) => {
                let msg = res || (file.fullPath + '生成成功！！');
                if (msg.indexOf('成功') >= 0) {
                    this.success(msg);
                } else
                    this.error(msg);
            }));
            outs.push(rx);
        });
        zip(...outs).subscribe(() => {
            this.generating = 2;
        });
    }

}