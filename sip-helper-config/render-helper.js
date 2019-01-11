/// <reference path="./sip-helper.d.ts" />

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
RenderHelper.debug = false;

/**
 * 扩展helper
 */
RenderHelper.extend(_helper);


