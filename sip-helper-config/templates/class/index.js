/// <reference path="../../sip-helper.d.ts" />


/** 定义输入 */
// {
//     name: string;
//     title?: string;
//     defaultValue?: any;
//     desc?: string;
//     readonly?: boolean;
//     /** 数据源， [{value:'', text:''}] */
//     source?: any;
//     uiType?: 'input' | 'texteare' | 'select' | 'boolean';
// }
SipRender.inputs([]);

/** 定义 render 模板 */
// {
//     /** 是否目录 */
//     "isDir": boolean;
//     /** 目录时无效, 可以使用render */
//     "fileName": string;
//     /** 扩展名称, 可以使用render */
//     "extend": string;
//     /** 生成文件所在路径, 可以使用render */
//     "path": string;
//     /** 模板位置, 可以使用render */
//     "templateFile": string;
// }
SipRender.templates([
    {
        "isDir": false,
        "fileName": "@{input}",
        "extend": "ts",
        "path": "",
        "templateFile": "./class.txt",
        "templateExtend": "./class.js"
    }
]);

/**
 * 扩展 render template数据, 这里会在所有模板文件生效
 *  $template: template数据
 *  $helper: 为render-helper.js定义内容
 * 
 */
SipRender.extend(function($template, $helper){

    $template.className = $helper.upperCamel($data.fileName);

});