/// <reference path="../../sip-helper.d.ts" />

/**
 * 扩展 render template数据，这里只在本模板文件生效
 *  $data: template数据
 *  $helper: 为render-helper.js定义内容
 *  $form：为UI输入内容，object
 */
SipRender.extend(function ($data, $helper, $form) {
    $data.hello = "hello world" + ' - ' + $form.text1;
});