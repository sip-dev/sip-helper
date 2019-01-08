
export const VARS = [
    'input', 'isDir', 'isLinux', 'tmplName',
    'fileName', 'pathType', 'extend', 'path', 'className',
    'curPath', 'curFile', 'workspaceRoot', '$data', '$helper'
];

export function JoinPath(path: string, fileName: string, isLinux?: boolean): string {
    let pathSplice = isLinux !== false ? '/' : '\\';
    return [!path ? '': path.trim(), !fileName ? '' : fileName.trim()].join(pathSplice).replace(/[\\\/]{1,}/g, pathSplice).replace(/^\s*[\/\\]/, '').replace(/[\/\\]\s*$/, '');
}
