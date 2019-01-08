/// <reference path="../../sip-helper.d.ts" />

/** 定义Form */
SipRender.forms([
    {
        name: 'text1',
        title: 'text-title',
        uiType: 'input',
        /** 只能使用 @{传入参数} 或 @{$form.name}(注意定义顺序) */
        defaultValue: '@{input}-input',
        source: null,
        style: null,
        desc: 'text-desc'
    },
    {
        name: 'select1',
        title: 'select-title',
        uiType: 'select',
        defaultValue: '1',
        source: [{ value: '1', text: '1111' }, { value: '2', text: "2222" }],
        style: null,
        desc: 'select-desc'
    },
    {
        name: 'textarea1',
        title: 'textarea-title',
        uiType: 'textarea',
        defaultValue: '@{input}-textarea',
        source: null,
        style: null,
        desc: ''
    }
]);

/** 定义 render 模板 */
SipRender.templates([
    {
        "isDir": false,
        "fileName": "@{input}",
        "extend": "ts",
        "path": "@{curPath}",
        "templateFile": "./class.tmpl",
        "templateExtend": "./class.js"
    }
]);

/**
 * 扩展 render template数据, 这里会在所有模板文件生效
 *  $data: template数据
 *  $helper: 为render-helper.js定义内容
 *  $form：为UI输入内容，object
 */
SipRender.extend(function ($data, $helper, $form) {

    $data.className = $helper.upperCamel($data.fileName);

});