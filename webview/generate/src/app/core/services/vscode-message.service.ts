import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IVscodeOption } from '../base';
import { SipRenderFile } from '../sip-render-file';

declare const vscode: any;

let _msgId = 0;

export const vscode_msg = (msg: string, data?: any) => <T>(source: Observable<T>) => {
    return new Observable<T>(observer => {
        source.subscribe({
            next: function (r) {
                if (!environment.isVscode) {
                    observer.next(null); return;
                }
                let id = (_msgId++);
                if (_msgId == 999) _msgId = 0;
                vscode.postMessage({ id: id, command: msg, data: data });
                let msg_receive = msg + '_receive';
                let fn = function (event) {
                    const message = event.data;
                    let command = message.command;
                    if (message.id == id) {
                        window.removeEventListener('message', fn);
                        observer.next(message.data);
                    }
                };
                window.addEventListener('message', fn);
            },
            error: function (r) {
                observer.error(r);
            }
        });
    });
}

@Injectable()
export class VscodeMessageService {

    options: IVscodeOption;

    private _sendMsg(msg: string, data?: any): Observable<any> {
        let obs = of(null);
        return environment.isVscode ? obs.pipe(vscode_msg(msg, data)) : obs;
    }

    public get input(): string {
        return this.options.input;
    }
    public set input(p: string) {
        this.options.input = p;
    }

    private _inited = false;
    _startUP(callback: () => void) {
        if (this._inited) { callback(); return }
        this._sendMsg('options').subscribe(async (p) => {
            this.options = Object.assign({
                curPath: "d:\\root\\demo",
                curFile: "",
                isDir: true,
                isLinux: false,
                input: 'demo',
                fileName: '',
                tmplName: '',
                tmplPath: '',
                debug: false,
                tmplIndex: '',
                workspaceRoot: 'd:\\root',
                extensionPath: 'd:\\temp\\extension',
                modules: []
            }, p);
            let options = this.options;
            if (!environment.production) {
                options.helper = environment.render.helper;
                options.tmplIndex = environment.render.index;
            }

            options.modules = options.modules.slice();

            let helper: any = {};
            if (options.helper) {
                let RenderHelper = {
                    debug: false,
                    extend: function (obj: any) {
                        helper = obj;//保持原有对象，公共对像
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
                };
                try {
                    (new Function('RenderHelper', options.helper))(RenderHelper);
                    SipRenderFile.debug = options.debug = RenderHelper.debug;
                    SipRenderFile.helper = helper;
                    SipRenderFile.warning('RenderHelper');
                    SipRenderFile.log(options.helper);
                } catch (e) {
                    SipRenderFile.error(`RenderHelper：${e.toString()}`);
                }
            }

            let _extendField = ['curPath', 'curFile', 'isDir', 'input', 'isLinux', 'tmplName', 'workspaceRoot'];
            let renderExtend = SipRenderFile.extend;
            _extendField.forEach(function (key) {
                renderExtend[key] = options[key];
            });
            SipRenderFile.warningOut('传入参数');
            SipRenderFile.logOut(JSON.stringify(renderExtend));
            callback();
        });
    }

    close() {
        this._sendMsg('close').subscribe();
    }

    /**
     * 保存文件
     * @param file 文件名称（相对basePath，如：demo/demo.ts）
     * @param content 保存内容
     * @param basePath 默认为当前路径
     * @param flag 'w'
     * @example saveFile('name1111', 'test11112').subscribe()
     */
    saveFile(file: string, content: string, basePath?: string, flag?: 'w' | null, dir?: boolean): Observable<string> {
        return this._sendMsg('saveFile', { basePath: basePath, file: file, content: content, flag: flag, dir: dir === true });
    }

    /**
     * 保存文件
     * @param fullPath 文件名称（全路径，如：c:\demo\demo.ts）
     * @param content 保存内容
     * @param flag 'w'
     * @example saveFile('name1111', 'test11112').subscribe()
     */
    saveFileEx(fullPath: string, content: string, flag?: 'w' | null, dir?: boolean): Observable<string> {
        return this._sendMsg('saveFile', { fullPath: fullPath, content: content, flag: flag, dir: dir === true });
    }

    readFile(file: string, basePath?: string): Observable<string> {
        return this._sendMsg('readFile', { basePath: basePath, file: file }).pipe(map(function (content) {
            if (!environment.production) {
                switch (file) {
                    case 'templateFile':
                        return environment.render.template;
                    case 'templateExtend':
                        return environment.render.script;
                }
            }
            return content;
        }));
    }

    readFileEx(fullPath: string): Observable<string> {
        return this._sendMsg('readFile', { fullPath: fullPath }).pipe(map(function (content) {
            if (!environment.production) {
                switch (fullPath) {
                    case 'templateFile':
                        return environment.render.template;
                    case 'templateExtend':
                        return environment.render.script;
                }
            }
            return content;
        }));
    }

    openFile(file: string, basePath?: string): Observable<string> {
        return this._sendMsg('openFile', { basePath: basePath, file: file });
    }

    openFileEx(fullPath: string): Observable<string> {
        return this._sendMsg('openFile', { fullPath: fullPath });
    }


    log(msg: any): Observable<void> {
        return this._sendMsg('log', msg);
    }

    importToModule(file: string, moduleFile: string, className: string, regOpt: {
        moduleExport?: boolean;
        moduleImport?: boolean;
        moduleDeclaration?: boolean;
        moduleEntryComponent?: boolean;
        moduleProvider?: boolean;
        moduleRouting?: boolean;
        routePath?: string;
        isModule?: boolean;
    }, basePath?: string): Observable<string> {
        return this._sendMsg('importToModule', { basePath: basePath, file: file, moduleFile: moduleFile, className: className, regOpt: regOpt });
    }

}
