

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
    /** 默认值, 可以使用render，只能使用 @{内置数据} 或 $form数据(注意定义顺序)*/
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
}

interface SipRenderTemplateItem {
    /** 是否目录 */
    "isDir": boolean;
    /** 目录时无效, 可以使用render，(render顺序：fileName, extend, path) */
    "fileName": string;
    /** 扩展名称, 可以使用render，(render顺序：fileName, extend, path) */
    "extend": string;
    /** 生成文件所在路径, 可以使用render，(render顺序：fileName, extend, path) */
    "path": string;
    /** 模板位置 */
    "templateFile": string;
    /** 模板 */
    "template": string;
    /** 在$form里的名称，留空不处理 */
    "formName"?:string;
    /** 在$form里的初始值 */
    "formValue"?:boolean;
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

export interface SipRenderScriptContext {
    /** form 处理之前，$form为空数据 */
    beforeForms?:(forms:SipRenderFormItem[])=>void;
    /** form 处理之后，$form数据已经处理好 */
    afterForms?:(forms:SipRenderFormItem[])=>void;
    /** 模板配置 处理之前，可以根据$form数据前端处理template */
    beforeTemplate?:(templates:SipRenderTemplateItem[])=>void;
    /** 模板配置 处理之后 */
    afterTemplate?:(templates:SipRenderTemplateItem[])=>void;
    /** 最后做准备，处理$data，每个模板文件处理一次 */
    render?:(template:SipRenderTemplateItem, index:number)=>void;
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
     * 脚本
     *  $data: template数据
     *  $helper: 为render-helper.js定义内容
     *  $form：为UI输入后内容，object
     */
    script: (extend: ($data: SipRenderExtendData, $helper: any, $form: any) => SipRenderScriptContext) => void;
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