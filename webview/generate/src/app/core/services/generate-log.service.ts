import { Injectable } from '@angular/core';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { SipRenderInputItem, SipRenderOut, SipRenderTemplateItem } from '../base';
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
        let options = this._vsMsg.options;
        this.isLinux = options.isLinux;
        this.tmplPath = options.tmplPath;

        this.log('初始化');
        let tmplIndex = _vsMsg.options.tmplIndex;
        if (tmplIndex) {
            try {
                this.log('解释index.js');
                (new Function('SipRender', tmplIndex))({
                    inputs: (inputs) => {
                        this.inputs = inputs;
                    },
                    templates: (templates) => {
                        this.templates = templates;
                    },
                    extend: (fn) => {
                        this.extendFn = fn;
                    }
                });
                this.log('读取templateFile和templateExtend');
                this.loadTemplateContent().subscribe(() => {
                    this.log('generate');
                    this.generate();
                });
            } catch (e) {
                this.log(e.toString());
            }
        } else {
            this.log('没有index.js内容');
        }
    }

    joinPath(path) {
        return JoinPath(this.tmplPath, path, this.isLinux);
    }

    loadTemplateContent() {
        let loadList = [];
        let rxTemp = null;
        this.templates.forEach((item) => {
            rxTemp = this._vsMsg.readFile(this.joinPath(item.templateExtend)).pipe(map(function (content) {
                item.script = content;
            }));
            loadList.push(rxTemp);
            rxTemp = this._vsMsg.readFile(this.joinPath(item.templateFile)).pipe(map(function (content) {
                item.content = content;
            }));
            loadList.push(rxTemp);
        });
        return zip(...loadList);
    }

    log(...args: string[]) {
        this.genReports.push(...args);
    }

    vscodeLog(str: string) {
        this._vsMsg.log(str).subscribe();
    }

    private rd = new SipRenderFile();
    genReports: string[] = [];
    generating = 0;
    generateFirstFile: string;
    generate() {
        this.genReports = [];
        this.generating = 1;
        let saveList: SipRenderOut[] = [];
        this.generateFirstFile = '';
        let input = this._vsMsg.input;
        let tmplName = this._vsMsg.options.tmplName;
        this.templates.forEach((tamplate) => {
            saveList.push(this.rd.render(tamplate, this.extendFn, tmplName, input));
        });

        let outs = [];
        saveList.forEach((file) => {
            if (!file.dir) {
                this.generateFirstFile || (this.generateFirstFile = file.fileName);
                this.genReports.push(...file.logs);
            }
            let rx = this._vsMsg.saveFile(file.fileName, file.content, null, null, file.dir).pipe(map((res) => {
                this.genReports.push(res || (file.fileName + '生成成功！！'));
            }));
            outs.push(rx);
        });
        zip(...outs).subscribe(() => {
            // this.generating = 2;
        });
    }

}
