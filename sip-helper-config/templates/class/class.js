/// <reference path="../../sip-helper.d.ts" />

/**
 * 扩展 render template数据，这里只在本模板文件生效
 *  $data: template数据
 *  $helper: 为render-helper.js定义内容
 * 
 */
SipRender.extend(function ($data, $helper) {
    $data.hello = "hello world";
});