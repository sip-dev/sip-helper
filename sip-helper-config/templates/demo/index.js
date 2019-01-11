/// <reference path="../../sip-helper.d.ts" />

/** 定义Form */
SipRender.forms([
    {
        name: 'text1',
        title: 'text-title',
        uiType: 'input',
        /** 只能使用 @{内置数据} 或 $form数据(注意定义顺序) */
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
        "templateFile": "./demo.tmpl",
        "formName": "demo.tmpl",
        "formValue": true
    }
]);

/**
 * 脚本
 *  $data: template数据
 *  $helper: 为render-helper.js定义内容
 *  $form：为UI输入后内容，object
 */
SipRender.script(function ($data, $helper, $form) {

    return {
        beforeForms(forms) {
        },
        afterForms(forms) {
        },
        beforeTemplate(tempaltes) {
        },
        afterTemplate(tempaltes) {
        },
        render(tempalte, index) {
            $data.className = $helper.upperCamel($data.fileName);
            $data.hello = "hello world" + ' - ' + $form.text1;
        }
    };

});