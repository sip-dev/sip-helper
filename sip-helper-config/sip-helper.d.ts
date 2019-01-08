

interface IRenderHelper {
    /** 是否debug模式 */
    debug: boolean;
    /** $helper */
    extend: (helper) => void;
    /**
     * log信息
     */
    log: (...args: string[]) => string;
    /**
     * log warning信息
     */
    warning: (...args: string[]) => string;
    /**
     * log error信息
     */
    error: (...args: string[]) => string;
}


declare const RenderHelper: IRenderHelper;


interface SipRenderFormItem {
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

interface SipRenderTemplateItem {
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
}

/** $data 内置数据 */
interface SipRenderExtendData {
    /** 输入input */
    'input': string;
    /** 模板名称 */
    'tmplName': string;
    /** 是否目录 */
    'isDir': boolean;
    /** 是否linux */
    'isLinux': boolean;
    /** 输入的文件名称 */
    'fileName': string;
    /** 输入的扩展名称 */
    'extend': string;
    /** 输入的路径 */
    'path': string;
    /** 当前选择文件目录 */
    'curPath': string;
    /** 当前选择文件 */
    'curFile': string;
    /** 当前环境目录 */
    'workspaceRoot': string;
    [key: string]: any;
}

interface ISipRender {
    /**
     * 设置生成时UI输入
     */
    forms: (options: SipRenderFormItem[]) => void;
    /**
     * 设置模板内容
     */
    templates: (templates: SipRenderTemplateItem[]) => void;
    /**
     * 扩展 $data
     */
    extend: (extend: ($data: SipRenderExtendData, $helper: any, $form:any) => void) => void;
    /**
     * log信息
     */
    log: (...args: string[]) => string;
    /**
     * log warning信息
     */
    warning: (...args: string[]) => string;
    /**
     * log error信息
     */
    error: (...args: string[]) => string;
}

declare const SipRender: ISipRender;