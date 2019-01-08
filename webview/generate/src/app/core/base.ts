
export interface IFileItem {
    input?: string;
    fileName: string;
    path: string;
    pathType?: 'dir' | 'file';
    type: string;
    className: string;
    typeInfo?: IGenTypeInfo;
    active: boolean;
    importToModue?: string;
    importToRouting?: string;
    tsContent?: string;
    specContent?: string;
    htmlContent?: string;
    styleContent?: string;
    extend?: string;
    extendContent?: string;
}

export interface IGenTypeInfo {
    ts?: boolean;
    html?: boolean;
    style?: boolean;
    styleType?: string;
    spec?: boolean;
    importToModue?: boolean;
    importToRouting?: boolean;
    moduleExport?: boolean;
    moduleImport?: boolean;
    moduleDeclaration?: boolean;
    moduleEntryComponent?: boolean;
    moduleProvider?: boolean;
    extend?: boolean;
}

export interface IGenType {
    [key: string]: IGenTypeInfo;
}

/** 插件传过来的参数 */
export interface IVscodeOption {
    /** 是否debug模式 */
    debug:boolean;
    curPath?: string;
    curFile?: string;
    isDir?: boolean;
    isLinux?: boolean;
    input?: string;
    tmplName?: string;
    tmplPath?: string;
    tmplIndex?: string;
    prefix?: string;
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

/** 输入 */
export interface FormItem {
    name: string;
    title?: string;
    defaultValue?: any;
    desc?: string;
    readonly?: boolean;
    /** 数据源， [{value:'', text:''}] */
    source?: any;
    uiType?: 'input' | 'texteare' | 'select' | 'boolean';
}

/** 模板 */
export interface ITmplItem {
    title: string;
    index?: number;
    active?: boolean;
    files: IFileItem[];
    forms?: FormItem[];
}

/** 保存模板配置 */
export interface IConfig {
    prefix?: string;
    templates?: ITmplItem[];
}



export interface SipRenderInputItem {
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
    /** 输入UI类型 */
    uiType?: 'input' | 'textarea' | 'select';
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