'use strict';
import * as fs from 'fs';
import * as path from 'path';
import { commands, ExtensionContext, Position, Range, Terminal, TextDocument, Uri, ViewColumn, window, workspace } from 'vscode';
import { CalcPath, FindModuleFile, FindPathUpward, FindUpwardModuleFiles, IsDirectory, MakeClassName } from './contents/content-base';
import { Lib } from './lib';

let argv = require('yargs-parser');

var jsonic = require('jsonic');

function getCurrentPath(args): string {
    return args && args.fsPath ? args.fsPath : (window.activeTextEditor ? window.activeTextEditor.document.fileName : '');
}

function getRelativePath(args): string {
    let fsPath = getCurrentPath(args);

    return CalcPath(fsPath);
}

export interface IParam {
    param: string;
    title: string;
    input: boolean;
    terminal?: string;
}

export interface IConfigCommand {
    command: string;
    title: string;
    terminal: string;
    input: boolean;
    path: string;
    builtin: boolean;
    children: IConfigCommand[];
    params: IParam[];
}

export function activate(context: ExtensionContext) {

    let _rootPath = workspace.rootPath;
    let _getRootPath = (): string => {
        return _rootPath;
    }, _calcRootPath = (curPath: string) => {
        curPath = CalcPath(curPath);
        _rootPath = FindPathUpward(workspace.rootPath, curPath, 'package.json')
            && workspace.rootPath;
    };

    context.subscriptions.push({
        dispose: () => {
            Object.keys(terminals).forEach(key => {
                dispose_Terminal(key);
            })
        }
    });
    let mkdirSync = function (fsPath: string) {
        let pathParent = path.dirname(fsPath);
        if (!fs.existsSync(pathParent)) mkdirSync(pathParent);
        fs.mkdirSync(fsPath);
    };

    let _sipConfigPath = './sip-helper-config';
    let _getConfigPath = (joinPath?: string) => {
        let fsPath = path.join(_getRootPath(), _sipConfigPath);
        return joinPath ? path.join(fsPath, joinPath) : fsPath;
    };
    let _getTemplatePath = (joinPath?: string) => {
        let fsPath = _getConfigPath('templates');
        return joinPath ? path.join(fsPath, joinPath) : fsPath;
    };
    let _getTemplateIndexPath = (tmpl?: string) => {
        let fsPath = _getTemplatePath([tmpl, 'index.js'].join('/'));
        return fsPath;
    };
    let _getHelper = () => {
        let fsPath = _getConfigPath('render-helper.js');
        return (!fs.existsSync(fsPath)) ? '' : fs.readFileSync(fsPath, 'utf-8');
    };
    let _getTemplates = (): string[] => {
        let fsPath = _getTemplatePath();
        let templates = [];
        if (fs.existsSync(fsPath)) {
            let fileList = fs.readdirSync(fsPath, 'utf-8');
            if (fileList) {
                fileList.forEach(function (item: string) {
                    if (fs.existsSync(_getTemplateIndexPath(item))) {
                        let info = fs.statSync(_getTemplatePath(item));
                        if (info.isDirectory()) templates.push(item);
                    }
                });
            }
        }

        return templates;
    };
    function copyDir(fromDir, toDir) {
        if (!fs.existsSync(toDir)) mkdirSync(toDir);
        fs.readdirSync(fromDir).forEach(function (file) {
            var fromPathname = path.join(fromDir, file);
            var toPathname = path.join(toDir, file);

            if (fs.statSync(fromPathname).isDirectory()) {
                copyDir(fromPathname, toPathname);
            } else {
                fs.writeFileSync(toPathname, fs.readFileSync(fromPathname, 'utf8'), 'utf8');
            }
        });
    }

    let _initConfigPath = () => {
        let fsPath = _getConfigPath();
        if (!fs.existsSync(fsPath)) {
            let fromPath = path.join(context.extensionPath, _sipConfigPath);
            copyDir(fromPath, fsPath);
        }

    };

    context.subscriptions.push(commands.registerCommand('siphelper.sipgenerate', (args) => {
        _initConfigPath();

        _preDoneRegisterCommand(args);
        let picks = _getTemplates();
        window.showQuickPick(picks).then(tmpl => {
            if (!tmpl) return;
            if (args && args.template){
                let tmplPath = _getTemplateIndexPath(tmpl);
                _openFile(tmplPath);
                return;
            }
            window.showInputBox({
                prompt: '请输入文件名称/内容？',
                value: _fileName
            }).then((fileName) => {
                if (fileName) {
                    if (/[~`!#$%\^&*+=\[\]\\';,{}|\\":<>\?]/g.test(fileName)) {
                        window.showInformationMessage('文件名称存在不合法字符!');
                    } else {
                        showSipGenerateUI(args, { tmpl: tmpl, input: path.basename(fileName), path: path.dirname(fileName) });
                    }
                }
            },
                (error) => console.error(error));
        });
    }));

    context.subscriptions.push(commands.registerCommand('siphelper.component.switchfile', (args) => {
        let curFile = getCurrentPath(args);
        let curPath = path.dirname(curFile);
        let curFileName = path.basename(curFile);
        let curFileList = fs.readdirSync(curPath);
        if (curFileList && curFileList.length > 0) {
            let picks = curFileList.filter((fileName) => fileName != curFileName && !IsDirectory(path.join(curPath, fileName)));

            window.showQuickPick(picks).then(file => {
                if (!file) return;
                file = path.join(curPath, file);
                _openFile(file);
            });
        }
    }));

    let _fileName = '', _curFile = '';
    context.subscriptions.push(commands.registerCommand('siphelper.quickpicks', (args) => {
        let curPath = _preDoneRegisterCommand(args);

        _calcRootPath(curPath);

        let configs = _commands;

        showQuickPick(configs, _getRootPath(), args);

    }));

    let terminals = {};
    let send_terminal = (name: string, path: string, cmd: string) => {
        name || (name = "ng-alain-sip");
        dispose_Terminal(name);
        let terminal = terminals[name] = window.createTerminal(name);
        terminal.show(true);
        path && terminal.sendText('cd "' + path + '"');
        terminal.sendText(cmd);
    };
    let dispose_Terminal = (name: string) => {
        let terminal: Terminal = terminals[name];
        try {
            if (terminal) {
                terminals[name] = null;
                terminal.dispose();
            }
        } catch (e) {
            return;
        }
    };
    let getVarText = (text: string, params: { args: any; input: string; params: string; }): string => {
        text = text.replace(/\%currentpath\%/gi, getRelativePath(params.args));
        text = text.replace(/\%workspaceroot\%/gi, _getRootPath());
        text = text.replace(/\%input\%/gi, params.input);
        text = text.replace(/\%params\%/gi, params.params);
        return text;
    };
    let _openFile = (file: string): PromiseLike<TextDocument> => {
        return file ? workspace.openTextDocument(file).then(r => {
            window.showTextDocument(r, { preview: false });
            return r;
        }) : Promise.resolve<any>(null);
    };
    let send_builtin = (config: IConfigCommand, args, params: string, fsPath: string, inputText: string) => {
        let p = argv(params || '');
        let rootPath = _getRootPath();
        let gParam = Object.assign({
            name: inputText,
            path: fsPath,
            rootPath: rootPath,
            moduleFile: FindModuleFile(rootPath, fsPath)
        }, p);
        switch (config.command) {
            case 'npm':
                npm();
                break;
            case 'snippet-text':
                commands.executeCommand('siphelper.tosnippettext', args);
                break;
            case 'json-class':
                commands.executeCommand('siphelper.jsontoclass', args);
                break;
            case 'json-interface':
                commands.executeCommand('siphelper.jsontointerface', args);
                break;
            case 'region':
                commands.executeCommand('siphelper.region', args);
                break;
            case 'sip-generate':
                commands.executeCommand('siphelper.sipgenerate', args);
                break;
            case 'sip-template':
                _initConfigPath();
                commands.executeCommand('siphelper.sipgenerate', Object.assign({ template: true }, args));
                break;
        }
    };

    let showQuickPick = (configs: IConfigCommand[], parentPath: string, args) => {
        let picks = configs.map(item => item.title);

        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let config: IConfigCommand = configs.find(item => item.title == title);
            if (!config) return;
            let path = config.path ? config.path : parentPath;
            let children = config.children;
            let params = config.params;
            if (children && children.length > 0) {
                showQuickPick(children, path, args);
            } else if (params && params.length > 0) {
                showParamsQuickPick(config, path, args);
            } else {
                send_command(config.terminal, path, config.command, '', config.input, args, config);
            }
        });

    };
    let showParamsQuickPick = (config: IConfigCommand, path: string, args) => {
        let params = config.params;

        let doneFn = (param: IParam) => {
            let cmd = config.command;
            if (!cmd) return;
            let input = 'input' in param ? param.input : config.input;
            send_command(param.terminal || config.terminal, path, cmd, param.param, input, args, config);
        };

        if (params.length <= 1) {
            doneFn(params[0]);
            return;
        }

        let picks = params.map(item => item.title);
        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let param: IParam = params.find(item => item.title == title);
            param && doneFn(param);
        });
    };

    let send_command = (name: string, path: string, cmd: string, params: string, input: boolean, args, config: IConfigCommand, inputText = '') => {
        if (!input) {
            path = getVarText(path, {
                args: args,
                input: inputText, params: params
            });
            if (config.builtin) {
                send_builtin(config, args, params, path, inputText);
            } else if (cmd) {
                cmd = getVarText(cmd, {
                    args: args,
                    input: inputText, params: params
                });
                send_terminal(name, path, cmd);
            }
        }
        else {
            window.showInputBox({
                prompt: '请输入文件名称/内容？',
                value: _fileName
            }).then((fileName) => {
                if (fileName) {
                    if (/[~`!#$%\^&*+=\[\]\\';,{}|\\":<>\?]/g.test(fileName)) {
                        window.showInformationMessage('文件名称存在不合法字符!');
                    } else {
                        send_command(name, path, cmd, params, false, args, config, fileName);
                    }
                }
            },
                (error) => console.error(error));
        }
    };

    let getCommands = (): IConfigCommand[] => {
        let fsPath = fs.readFileSync(path.join(context.extensionPath, 'commands.config.json'), 'utf-8');
        return jsonic(fsPath);
    };
    let _commands = getCommands();

    let npm = () => {
        let fsPath = path.join(_getRootPath(), './package.json');
        if (!fs.existsSync(fsPath)) return;
        let packageJson = jsonic(fs.readFileSync(fsPath, 'utf-8'));
        let scripts = packageJson.scripts;
        let scriptList = Object.keys(scripts).map(key => {
            return {
                command: 'npm run ' + key,
                title: key
            };
        });
        let picks = scriptList.map(item => item.title);

        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let item: any = scriptList.find(item => item.title == title);
            if (!item) return;
            send_terminal('sip-npm-' + title, _getRootPath(), item.command);
        });
    };

    context.subscriptions.push(commands.registerTextEditorCommand('siphelper.tosnippettext', (textEditor, edit) => {
        _calcRootPath(textEditor.document.fileName);

        var { document, selection } = textEditor
        let isEmpty = textEditor.selection.isEmpty;

        var text = isEmpty ? document.getText() : document.getText(textEditor.selection);
        text = formatSnippetText(text);
        edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
            textEditor.selection, text);
    }))

    let formatSnippetText = (text: string): string => {

        let preLen = -1;
        text = ['["', text.replace(/\n\r|\r\n/g, '\n').split('\n').map(item => {
            if (preLen == -1) {
                preLen = /^\s*/.exec(item)[0].length || 0;
            }
            return item.replace(/(\"|\\)/g, '\\$1').replace(/(\$)/g, '\\\\$1').substr(preLen).replace(/\t/g, '\\t');
        }).join('",\n"'), '$0"]'].join('');

        return text;
    };

    context.subscriptions.push(commands.registerTextEditorCommand('siphelper.jsontoclass', (textEditor, edit) => {
        let fsFile: string = textEditor.document.fileName;
        _calcRootPath(fsFile);

        let { document, selection } = textEditor

        let isEmpty = textEditor.selection.isEmpty;

        let text = isEmpty ?
            document.getText() :
            document.getText(textEditor.selection);
        try {

            text = jsonToClass(jsonic(text), fsFile);
            edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
                textEditor.selection, text);
        } catch (e) {
            window.showErrorMessage(e.message);
        }
    }))

    let jsonToClass = (json: object, fsFile: string): string => {
        let props = [], item, defName;
        Object.keys(json).forEach(key => {
            item = json[key];
            key += '?';
            if (Lib.isString(item)) {
                defName = key + ': string';
                props.push('    ' + defName + ' = "";');
            } else if (Lib.isBoolean(item)) {
                defName = key + ': boolean';
                props.push('    ' + defName + ' = false;');
            } else if (Lib.isNumeric(item)) {
                defName = key + ': number';
                props.push('    ' + defName + ' = 0;');
            } else if (Lib.isArray(item)) {
                defName = key + ': any[]';
                props.push('    ' + defName + ' = [];');
            } else if (Lib.isObject(item)) {
                defName = key + ': object';
                props.push('    ' + defName + ' = {};');
            } else {
                defName = key + ': any';
                props.push('    ' + defName + ' = null;');
            }
        });

        let fInfo = path.parse(fsFile);
        let className = MakeClassName(fInfo.name, '');
        let classText = `//定义模型(model)
export class ${className} {

${props.join('\n')}

    constructor(p?: Partial<${className}>) {
        if (p){
            Object.assign(this, p);
        }
    }
}`;

        return classText;
    };

    context.subscriptions.push(commands.registerTextEditorCommand('siphelper.jsontointerface', (textEditor, edit) => {
        let fsFile: string = textEditor.document.fileName;
        _calcRootPath(fsFile);

        let { document, selection } = textEditor

        let isEmpty = textEditor.selection.isEmpty;

        let text = isEmpty ?
            document.getText() :
            document.getText(textEditor.selection);
        try {

            text = jsonToInterface(jsonic(text), fsFile);
            edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
                textEditor.selection, text);
        } catch (e) {
            window.showErrorMessage(e.message);
        }
    }))

    let jsonToInterface = (json: object, fsFile: string): string => {
        let props = [], item, defName;
        Object.keys(json).forEach(key => {
            item = json[key];
            key += '?';
            if (Lib.isString(item)) {
                defName = key + ': string';
                props.push('    ' + defName + ';');
            } else if (Lib.isBoolean(item)) {
                defName = key + ': boolean';
                props.push('    ' + defName + ';');
            } else if (Lib.isNumeric(item)) {
                defName = key + ': number';
                props.push('    ' + defName + ';');
            } else if (Lib.isArray(item)) {
                defName = key + ': any[]';
                props.push('    ' + defName + ';');
            } else if (Lib.isObject(item)) {
                defName = key + ': object';
                props.push('    ' + defName + ';');
            } else {
                defName = key + ': any';
                props.push('    ' + defName + ';');
            }
        });

        let fInfo = path.parse(fsFile);
        let className = MakeClassName(fInfo.name, '');
        let classText = `//定义模型(model)
export interface ${className} {

${props.join('\n')}

}`;

        return classText;
    };

    context.subscriptions.push(commands.registerTextEditorCommand('siphelper.region', (textEditor, edit) => {
        _calcRootPath(textEditor.document.fileName);

        var { document, selection } = textEditor
        let isEmpty = textEditor.selection.isEmpty;
        if (isEmpty) return;

        var text = document.getText(textEditor.selection);
        var time = new Date().valueOf();

        text = ['    //#region region' + time + '\n', text, '    //#endregion region' + time + '\n'].join('\n');
        edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
            textEditor.selection, text);
    }))

    function _preDoneRegisterCommand(args: any) {
        let curPath = _curFile = getCurrentPath(args), defaultName = path.basename(curPath);
        _calcRootPath(curPath);
        _fileName = defaultName.split('.')[0];
        return curPath;
    }

    function showSipGenerateUI(args: any, generateOpt?: any) {
        let inputFile = args ? getCurrentPath(args) : _curFile;
        let isDir = IsDirectory(inputFile);
        let fileName = path.basename(inputFile);
        let curFile = isDir ? '' : inputFile;
        let curPath = isDir ? inputFile : path.dirname(inputFile);
        let isLinux: boolean = curPath.indexOf('/') >= 0;
        let htmlFile = path.join(context.extensionPath, 'webview/generate/dist/generate/index.html');
        let htmlPath = path.dirname(htmlFile);
        const panel = window.createWebviewPanel('sipgenerate', 'sip-generate', ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [Uri.file(htmlPath)]
        });
        const webview = panel.webview;
        let html = fs.readFileSync(htmlFile, 'utf-8');
        let basePath = Uri.file(htmlPath).with({
            scheme: "vscode-resource"
        }).toString();
        html = html.replace('<base href=".">', `<base href="${basePath}/"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>const vscode = acquireVsCodeApi();window.isVscodeMode = true;</script>`);
        webview.html = html;
        let sendMsg = function (id: string, msg: string, data?: any, err?: any) {
            webview.postMessage({ id: id, command: msg, data: data, err: err });
            return msg + '_receive';
        };
        let receiveMsg = function (id: string, msg: string, data?: any, err?: any) {
            return sendMsg(id, msg + '_receive', data, err);
        };
        let workspaceRoot = _getRootPath();
        if (generateOpt && generateOpt.path) {
            curPath = path.join(curPath, generateOpt.path);
        }
        webview.onDidReceiveMessage(message => {
            let data = message.data;
            let cmd = message.command;
            let id = message.id;
            switch (cmd) {
                case 'options':
                    let input = isDir ? fileName : fileName.split('.')[0];
                    let tmplName = generateOpt ? generateOpt.tmpl : '';
                    let tmplPath = tmplName ? _getTemplatePath(tmplName) : '';
                    let indexContent = tmplName ? fs.readFileSync(_getTemplateIndexPath(tmplName), 'utf-8') : '';
                    let opt = {
                        curPath: curPath,
                        curFile: curFile,
                        isDir: isDir,
                        isLinux: isLinux,
                        input: input,
                        tmplName: tmplName,
                        tmplPath: tmplPath,
                        tmplIndex: indexContent,
                        prefix: 'app',
                        fileName: isDir ? '' : fileName,
                        workspaceRoot: workspaceRoot,
                        extensionPath: context.extensionPath,
                        modules: FindUpwardModuleFiles(workspaceRoot, inputFile).map(file => ['@{curPath}', path.relative(curPath, file)].join(isLinux ? "/" : "\\")),
                        generate: generateOpt,
                        helper: _getHelper()
                    };
                    receiveMsg(id, cmd, opt);
                    break;
                case 'saveFile':
                    /**data:{ file: 'demo/demo.ts', content: 'content', basePath:'', dir:false, fullPath:'' } */
                    let fullPath: string = data.fullPath ? data.fullPath : path.join(data.basePath || curPath, data.file);
                    let retFile = data.fullPath ? data.fullPath : path.relative(curPath, fullPath);
                    let overWrite = data.flag && data.flag.indexOf('w') >= 0;
                    if (fullPath && (overWrite || !fs.existsSync(fullPath))) {
                        try {
                            if (data.dir) {
                                mkdirSync(fullPath);
                                receiveMsg(id, cmd, [retFile, '成功'].join(', '));
                            } else {
                                let content: string = data.content;
                                let fsPath = path.dirname(fullPath);
                                if (!fs.existsSync(fsPath)) {
                                    mkdirSync(fsPath);
                                }
                                fs.writeFile(fullPath, content, { encoding: 'utf-8', flag: 'w' }, (err) => {
                                    receiveMsg(id, cmd, [retFile, err ? err.message : '成功'].join(', '));
                                });
                            }
                        }
                        catch (e) {
                            receiveMsg(id, cmd, [retFile, e.message].join(', '));
                        }
                    }
                    else
                        receiveMsg(id, cmd, [retFile, '文件已存在！'].join(', '));
                    break;
                case 'readFile':
                    let readFile: string = data.fullPath ? data.fullPath : path.join(data.basePath || curPath, data.file);
                    let readContent: string = '';
                    if (readFile && fs.existsSync(readFile)) {
                        try {
                            readContent = fs.readFileSync(readFile, 'utf-8');
                        } catch(e){

                        }
                    }
                    receiveMsg(id, cmd, readContent);
                    break;
                case 'log':
                    console.log(data)
                    receiveMsg(id, cmd);
                    break;
                case 'close':
                    panel.dispose();
                    break;
                case 'openFile':
                    _openFile(data.fullPath ? data.fullPath : path.join(data.basePath || curPath, data.file));
                    break;
            }
            // console.log(cmd, data);
        }, undefined, context.subscriptions);
    }
}

