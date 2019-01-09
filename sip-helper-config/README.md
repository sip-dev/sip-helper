# sip-helper-config

- 配置 sip-helper 文件

## render-helper.js

- 定义 render 的 $helper 对象，多个模板公共对象（可用于模板之间通讯）
- 目前不支持 require

## templates 目录

- 定义 Generate 模板内容，每个子目录为一套生成模板，入口为 index.js

## tmplName/index.js

-  SipRender.forms 有生成时 UI form 收集 $input 内容
- SipRender.templates 定义生成模板
- SipRender.extend 扩展 $data 内容

## 模板语法

- @{表达式} 输出表达式返回内容
- @{for item in list} ... @{/for}
- @{if ok} ... @{else ok1} ... @{/if}
- 特殊模板对象 $data, $helper, $form
- $data 为模板数据，@{fileName} 等效于 @{$data.fileName}
- $data 内置数据：请参考 sip-helper.d.ts
- $helper 对象在render-helper.js 定义
- $form 在模板 index.js 使用 SipRender.forms 定义，生成要输入内容