import { IFileItem, SipRenderOut, SipRenderTemplateItem } from "./base";
import { JoinPath } from "./lib";
import { SipRender } from "./sip-render";


/** file支持render内容的属性，注意顺序 */
const _fileProps = [
    'input', 'prefix',
    'fileName', 'extend', 'path', 'className'
];

function _makeFilePropVar(data: any): void {
    _fileProps.forEach(function (item) {
        data[item] = _getVarIn(data, data[item]);
    });
}

function _getVarIn(data: any, template: string): string {
    if (!template) return template;
    if (!SipRender.hasRender(template)) return template;
    return SipRender.render(template, data, SipRenderFile.helper);
}

/** template支持render内容的属性，注意顺序 */
const _tmplProps = [
    'input',
    'fileName', 'extend', 'path'
];
function _getTmplPropVar(data: any) {
    let newData={};
    _tmplProps.forEach(function (item) {
        newData[item] = data[item];
    });
}
function _makeTmplPropVar(data: any) {
    _tmplProps.forEach(function (item) {
        data[item] = _getVarIn(data, data[item]);
    });
}
let _logs: string[] = [];

export class SipRenderFile {
    /** $helper */
    static helper: any = {};
    /** 扩展 $data */
    static extend: any = {};
    static log(...args: string[]): '' {
        _logs.push(...args);
        return '';
    }

    /** renderFile后返回logs */
    get logs(): string[] {
        return _logs;
    }

    renderFile(file: IFileItem, notConent?: boolean, tmplName?: string): SipRenderOut {
        _logs = [];

        let data = Object.assign({}, SipRenderFile.extend, file);
        if (tmplName) data.tmplName = tmplName;

        _makeFilePropVar(data);

        let ret: SipRenderOut = {
            fileName: JoinPath(data.path, data.fileName),
            content: notConent === true ? '' : _getVarIn(data, data.extendContent),
            dir: data.pathType == 'dir',
            logs: _logs
        };

        return ret;
    }

    getFileFullPath(file: IFileItem, tmplTitle: string) {
        let info = this.renderFile(file, true, tmplTitle);

        let fileName = info.fileName;
        return info.dir ? fileName : [fileName, file.extend].join('.');
    }

    render(template: SipRenderTemplateItem, extendFn: (data: any, helper: any) => void, tmplName: string, input: string): SipRenderOut {
        _logs = [];

        let isLinux = SipRenderFile.extend.isLinux;

        let data = Object.assign({}, SipRenderFile.extend, _getTmplPropVar(template));
        _makeTmplPropVar(data);
        data.tmplName = tmplName;
        data.input = input;
        if (extendFn) {
            try {
                extendFn(data, SipRenderFile.helper);
            } catch (e) {
                _logs.push(e.toString());
            }
        }
        if (template.script) {
            try {
                _logs.push(`解释templateExtend ${template.templateExtend}`);
                (new Function('SipRender', template.script))({
                    inputs: (inputs) => {
                    },
                    templates: (templates) => {
                    },
                    extend: (fn) => {
                        fn(data, SipRenderFile.helper);
                    }
                });
            } catch (e) {
                _logs.push(e.toString());
            }
        }

        _logs.push(`解释template内容 ${template.templateFile}`);
        let ret: SipRenderOut = {
            fileName: JoinPath(data.path, data.fileName, isLinux),
            content: _getVarIn(data, template.content),
            dir: data.pathType == 'dir',
            logs: _logs
        };

        return ret;
    }



}