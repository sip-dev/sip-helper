

interface IRenderHelper {
    extend: (obj) => void;
    log: (...args: string[]) => string;
}


declare const RenderHelper: IRenderHelper;


interface SipRenderInputItem {
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
    /** 模板位置, 可以使用render */
    "templateFile": string;
}

interface SipRenderExtendTemplate {
    /** 输入input */
    'input': string;
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
    inputs: (options: SipRenderInputItem[]) => void;
    templates: (templates: SipRenderTemplateItem[]) => void;
    extend: (extend: ($template: SipRenderExtendTemplate, $helper: any) => void) => void
}

declare const SipRender: ISipRender;