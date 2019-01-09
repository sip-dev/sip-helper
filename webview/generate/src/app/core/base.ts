
/** 插件传过来的参数 */
export interface IVscodeOption {
    /** 是否debug模式 */
    debug: boolean;
    curPath?: string;
    curFile?: string;
    isDir?: boolean;
    isLinux?: boolean;
    input?: string;
    tmplName?: string;
    tmplPath?: string;
    tmplIndex?: string;
    fileName?: string;
    workspaceRoot?: string;
    extensionPath?: string;
    modules: string[];
    generate?: {
        /** 输入内容 */
        input: string;
        /** 模板名称 */
        tmpl: string;
    };
    helper?: string;
}

export interface SipRenderFormItem {
    /** 变量名 */
    name: string;
    /** 显示标题 */
    title?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 描述 */
    desc?: string;
    /** 只读 */
    readonly?: boolean;
    /** 数据源，格式：[{value:'', text:''}]，如:select时用 */
    source?: any;
    style?: any;
    /** 输入UI类型 */
    uiType?: 'input' | 'textarea' | 'select';
    /** 是否模板 */
    isTemplate?: boolean;
    templates?: SipRenderTemplateItem[];
}

export interface SipRenderTemplateItem {
    /** 是否目录 */
    "isDir": boolean;
    /** 目录时无效, 可以使用render */
    "fileName": string;
    /** 扩展名称, 可以使用render */
    "extend": string;
    /** 生成文件所在路径, 可以使用render */
    "path": string;
    /** 模板位置 */
    "templateFile": string;
    /** 模板扩展位置 */
    "templateExtend": string;
    content?: string;
    script?: string;
    /** 在$form里的名称，留空不处理 */
    "formName"?: string;
    /** 在$form里的初始值, 只能 '1' | '0' */
    "formValue"?: boolean;
}

export interface SipRenderOut {
    fullPath: string;
    content?: string;
    dir: boolean;
    logs: LogItem[];
}

export enum LogStyle {
    default = 'list-group-item',
    success = 'list-group-item list-group-item-success',
    warning = 'list-group-item list-group-item-warning',
    error = 'list-group-item list-group-item-danger',
    info = 'list-group-item list-group-item-info'
}

export interface LogItem {
    text: string;
    style: LogStyle;
}