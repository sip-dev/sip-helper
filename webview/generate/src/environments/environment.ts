// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isVscode: window['isVscodeMode'] === true,
  render: {
    helper: `/// <reference path="./sip-helper.d.ts" />

    /** 定义helper */
    var _helper = {
        log: function () {
            return RenderHelper.log.apply(RenderHelper, arguments);
        },
        /** 大驼峰转换：sip-user_list.component ===> SipUserListComponent */
        upperCamel(str) {
            return (str || '').replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase(); }).replace(/[^a-z0-9]/gi, '');
        },
        /** 小驼峰转换：sip-user_list.component ===> sipUserListComponent */
        camel(str) {
            return _helper.upperCamel(str).replace(/^\w/, function (f) { return f.toLowerCase(); });
        }
    };

    /** 是否debug模式 */
    RenderHelper.debug = true;
        
    /**
     * 扩展helper
     * RenderHelper 提供两个方法：
     *  1. RenderHelper.extend(obj: object)
     *  2. RenderHelper.log(...args: string[])
     */
    RenderHelper.extend(_helper);
    `,
    index: `/// <reference path="../../sip-helper.d.ts" />

    /** 定义Form */
    SipRender.forms([
        {
            name: 'text1',
            title: 'text-title',
            uiType: 'input',
            /** 只能使用 @{内置数据} 或 @{$form.name}(注意定义顺序) */
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
            "templateExtend": "./demo.js",
            "formName":"demo.tmpl",
            "formValue": true
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
    
    });`,
    template: `
    class @{className} {

        hello = '@{hello}';
    
        form = {
            text:'@{$form.text1}',
            select:'@{$form.select1}',
            textarea:'@{$form.textarea1}',
            aaa:'@{$form['demo.tmpl']}'
        };
    
    }`,
    script: `/// <reference path="../../sip-helper.d.ts" />

    /**
     * 扩展 render template数据，这里只在本模板文件生效
     *  $data: template数据
     *  $helper: 为render-helper.js定义内容
     *  $form：为UI输入内容，object
     */
    SipRender.extend(function ($data, $helper, $form) {
        $data.hello = "hello world" + ' - ' + $form.text1;
    });`,
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
