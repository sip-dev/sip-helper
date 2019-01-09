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