import { LogItem, LogStyle, SipRenderExtendContext, SipRenderOut, SipRenderTemplateItem } from './base';
import { JoinPath } from "./lib";
import { SipRender } from "./sip-render";

function _getVarIn(data: any, template: string, form:any): string {
    if (!template) return template;
    if (!SipRender.hasRender(template)) return template;
    return SipRender.render(template, data, SipRenderFile.helper, form);
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

    static render(data: any, template: string, form?:any): string{
        return _getVarIn(data, template, form);
    }

    renderTmpl(template: SipRenderTemplateItem, extentContext: SipRenderExtendContext): SipRenderOut {
        _logs = [];


        let isLinux = SipRenderFile.extend.isLinux;

        let data = extentContext.data;
        let form = extentContext.form;

        let dir = template.isDir;
        let fullPath = data.path;
        let content = '';
        if (!dir) {
            fullPath = JoinPath(fullPath, data.fileName, isLinux);
            if (data.extend) fullPath = [fullPath, data.extend].join('.');
            content = _getVarIn(data, template.template, form);
        }
        let ret: SipRenderOut = {
            fullPath: fullPath,
            content: content,
            dir: dir,
            logs: _logs
        };
        SipRenderFile.log(`path：${ret.fullPath}`);
        SipRenderFile.log(`dir：${ret.dir}`);
        SipRenderFile.log(`content：${ret.content}`);

        return ret;
    }



}