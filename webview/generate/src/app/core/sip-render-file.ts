import { LogItem, LogStyle, SipRenderFormItem, SipRenderOut, SipRenderTemplateItem } from './base';
import { JoinPath } from "./lib";
import { SipRender } from "./sip-render";

function _getVarIn(data: any, template: string, form:any): string {
    if (!template) return template;
    if (!SipRender.hasRender(template)) return template;
    return SipRender.render(template, data, SipRenderFile.helper, form);
}

/** template支持render内容的属性，注意顺序 */
const _tmplProps = [
    'input',
    'fileName', 'extend', 'path'
];
function _getTmplPropVar(data: any) {
    let newData = {};
    _tmplProps.forEach(function (item) {
        newData[item] = data[item];
    });
    return newData
}
function _makeTmplPropVar(data: any, form:any) {
    _tmplProps.forEach(function (item) {
        data[item] = _getVarIn(data, data[item], form);
    });
}
function _makeFormPropVar(data: any, forms: SipRenderFormItem[]) {
    let form = {};
    forms.forEach(function (item) {
        let name = item.name;
        form[name] = data[name] = _getVarIn(data, item.defaultValue, form);
    });
    return form;
}
let _logs: LogItem[] = [];

export class SipRenderFile {
    static debug: boolean = false;
    /** $helper */
    static helper: any = {};
    /** 扩展 $data */
    static extend: any = {};
    static logOut(...args: string[]): '' {
        args.forEach(function (item) {
            _logs.push({
                text: item,
                style: LogStyle.info
            });
        });
        return '';
    }
    static log(...args: string[]): '' {
        if (!SipRenderFile.debug) return '';
        return this.logOut(...args);
    }
    static warningOut(...args: string[]): '' {
        args.forEach(function (item) {
            _logs.push({
                text: item,
                style: LogStyle.warning
            });
        });
        return '';
    }
    static warning(...args: string[]): '' {
        if (!SipRenderFile.debug) return '';
        return this.warningOut(...args);
    }
    static errorOut(...args: string[]): '' {
        args.forEach(function (item) {
            _logs.push({
                text: item,
                style: LogStyle.error
            });
        });
        return '';
    }
    static error(...args: string[]): '' {
        if (!SipRenderFile.debug) return '';
        return this.errorOut(...args);
    }
    /** renderFile后返回logs */
    static get logs(): LogItem[] {
        return _logs;
    }

    renderTmpl(template: SipRenderTemplateItem, extendFn: (data: any, helper: any, form:any) => void, tmplName: string, input: string, forms:SipRenderFormItem[]): SipRenderOut {
        _logs = [];

        let isLinux = SipRenderFile.extend.isLinux;

        let data = Object.assign({}, SipRenderFile.extend, _getTmplPropVar(template));
        data.tmplName = tmplName;
        data.input = input;
        let form = _makeFormPropVar(data, forms);
        _makeTmplPropVar(data, form);
        SipRenderFile.warning('SipRender.extend');
        if (extendFn) {
            try {
                SipRenderFile.log('SipRender.extend：index.js');
                extendFn(data, SipRenderFile.helper, form);
            } catch (e) {
                _logs.push({ text: e.toString(), style: LogStyle.error });
            }
        }
        if (template.script) {
            try {
                SipRenderFile.log(`SipRender.extend：${template.templateExtend}`);
                (new Function('SipRender', template.script))({
                    forms: (forms) => {
                    },
                    templates: (templates) => {
                    },
                    extend: (fn) => {
                        fn(data, SipRenderFile.helper, form);
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
            } catch (e) {
                _logs.push({ text: e.toString(), style: LogStyle.error });
            }
        }

        SipRenderFile.warning(`render template 内容：${template.templateFile}`);
        let dir = data.pathType == 'dir';
        let fullPath = data.path;
        let content = '';
        if (!dir) {
            fullPath = JoinPath(fullPath, data.fileName, isLinux);
            if (data.extend) fullPath = [fullPath, data.extend].join('.');
            content = _getVarIn(data, template.content, form);
        }
        let ret: SipRenderOut = {
            fullPath: fullPath,
            content: content,
            dir: data.pathType == 'dir',
            logs: _logs
        };
        SipRenderFile.log(`path：${ret.fullPath}`);
        SipRenderFile.log(`dir：${ret.dir}`);
        SipRenderFile.log(`content：${ret.content}`);

        return ret;
    }



}