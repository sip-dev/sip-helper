/// <reference path="../../sip-helper.d.ts" />


/** 定义输入 */
SipRender.inputs([]);

/** 定义 render 模板 */
SipRender.templates([
    {
        "isDir": false,
        "fileName": "@{input}",
        "extend": "ts",
        "path": "@{curPath}",
        "templateFile": "./class.txt",
        "templateExtend": "./class.js"
    }
]);

/**
 * 扩展 render template数据, 这里会在所有模板文件生效
 *  $data: template数据
 *  $helper: 为render-helper.js定义内容
 * 
 */
SipRender.extend(function ($data, $helper) {

    $data.className = $helper.upperCamel($data.fileName);

});