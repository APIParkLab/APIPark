import {ReactNode} from "react";
import {ApiBodyType} from "../const/api-detail";
import {ContentType} from "@common/components/postcat/api/ApiTest/components/ApiRequestTester/TestBody/const.ts";

declare type CheckedStatus = 'checked' | 'unchecked' | 'indeterminate'

export interface TreeNode<T = TreeNode<unknown>> {
    id: string
    children?: T[]
    path?: string[]
    parent?: T | null
    __raw__?: T
    __globalIndex__?: number
    __levelIndex__?: number
    __hasSiblingLeaf__?: boolean
}


interface CommonTreeNode<T = CommonTreeNode<unknown>> {
    children?: T[]
    childList?: T[]
    parent?: T
}
/**
 * Flattens a hierarchical tree structure into a flat array of nodes,
 * each enhanced with a path property representing its location within the tree.
 */
export function flattenTree<T extends TreeNode<T>>(
    tree: T[] = [],
    childrenKey: keyof T = 'children',
    pathKey: keyof T = 'id'
): T[] {
    const result: T[] = []
    let __globalIndex__ = 0

    const flatten = (node: T, path: string[], __levelIndex__: number, parent: T | null = null): void => {
        const { [childrenKey]: children, ...restNode } = node
        const nodeWithPath: T = {
            ...restNode,
            __raw__: node,
            path: [...path, node[pathKey]] as string[],
            __globalIndex__,
            __levelIndex__
        } as T
        nodeWithPath[childrenKey] = children
        nodeWithPath.parent = parent ?? null
        result.push(nodeWithPath)
        __globalIndex__++

        const list: T[] = (children || []) as unknown as T[]
        list.forEach((child: T, childIndex: number) => flatten(child, nodeWithPath.path || [], childIndex, node))
    }

    tree.forEach((node, index) => flatten(node, [], index))
    return result
}



export function byteToString(inputByteLength: number): string {
    inputByteLength = inputByteLength || 0

    // Define thresholds for byte units
    const KB = 1024
    const MB = 1024 * KB
    const GB = 1024 * MB

    // Helper function to format the byte length into a string
    const formatSize = (size: number, unit: string) => {
        const formattedSize = size.toFixed(2)
        // Remove unnecessary '.00'
        if (formattedSize.endsWith('.00')) {
            return `${parseInt(formattedSize, 10)} ${unit}`
        }
        return `${formattedSize} ${unit}`
    }

    // Convert and format byte length to appropriate unit
    if (inputByteLength < 0.1 * KB) {
        return formatSize(inputByteLength, 'B')
    } else if (inputByteLength < 0.1 * MB) {
        return formatSize(inputByteLength / KB, 'KB')
    } else if (inputByteLength < 0.1 * GB) {
        return formatSize(inputByteLength / MB, 'MB')
    } else {
        return formatSize(inputByteLength / GB, 'GB')
    }
}

export function determineCheckState<T extends { isRequired: 0 | 1 | boolean }>(items: T[]): CheckedStatus {
    let allChecked = true
    let allUnchecked = true

    for (const item of items) {
        if (item.isRequired) {
            allUnchecked = false
        } else {
            allChecked = false
        }

        if (!allChecked && !allUnchecked) {
            return 'indeterminate'
        }
    }

    return allChecked ? 'checked' : allUnchecked ? 'unchecked' : 'indeterminate'
}

export function generateId(): string {
    return Math.random().toString(36).slice(-8)
}


export const getActionColWidth = (actionButtonCount: number) => {
    if (actionButtonCount === 0) return 50
    return actionButtonCount * 30 + 20
}

export function renderComponent(content: ReactNode | null | undefined, fallbackComponent: ReactNode): ReactNode | null {
    if (content === null) return null
    return content ?? fallbackComponent
}

export function isNil(value: unknown): value is null | undefined {
    return typeof value === 'undefined' || value === null
}

export function traverse<T extends CommonTreeNode<T>>(
    node: T | T[] | null,
    cb: (node: T, level: number) => void,
    childrenKey: keyof T = 'children'
): void {
    if (!node) return;
    const queue: { node: T; level: number }[] = Array.isArray(node) ? node.map(n => ({ node: n, level: 0 })) : [{ node, level: 0 }];
    while (queue.length) {
        const { node: currentNode, level } = queue.shift()!
        cb(currentNode, level);
        const children = currentNode[childrenKey] as T[] | undefined;
        if (children && children.length > 0) {
            queue.push(...children.map(child => ({ node: child, level: level + 1 })));
        }
    }
}

export function generateNumberId(digit: number = 15): number {
    let result = ''
    for (let i = 0; i < digit; i++) {
        result += Math.floor(Math.random() * 10).toString()
    }
    return +result
}

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 type SafeAny = any
export const getQueryFromURL = (url: string): { [key: string]: string } => {
    const result: SafeAny = {};
    //? prevent double question mark
    new URLSearchParams(url.split('?').slice(1).join('?')).forEach((val, name) => {
        result[name] = val;
    });
    return result;
};

/**
 * Sync URL and Query
 *
 * @description Add query to URL and read query form url
 * @param url - whole url include query
 * @param query - ui query param
 * @param opts.method - sync method
 * @returns - {url:"",query:[]}
 */
export const syncUrlAndQuery = (
    url = '',
    query = [],
    opts: {
        nowOperate?: 'url' | 'query';
        method: 'replace' | 'keepBoth';
    } = {
        method: 'replace',
        nowOperate: 'url'
    }
) => {
    const urlQuery: SafeAny[] = [];
    const uiQuery = query;
    //Get url query
    const queryObj = getQueryFromURL(url);
    Object.keys(queryObj).forEach(name => {
        const value = queryObj[name];
        const item: SafeAny = {
            isRequired: 1,
            name,
            paramAttr: {
                example: value
            }
        };
        urlQuery.push(item);
    });
    const pre = opts.nowOperate === 'url' ? uiQuery : urlQuery;
    const next = opts.nowOperate === 'url' ? urlQuery : uiQuery;
    const result: SafeAny = {
        url,
        query
    };
    if (opts.method === 'replace') {
        result.query = [...next, ...pre.filter(val => !val.isRequired)];
    } else {
        result.query = [
            ...next.map(val => Object.assign(pre.find(val1 => val1.name === val.name) || {}, val)),
            ...pre.filter((val: SafeAny) => urlQuery.every(val1 => val1.name !== val.name))
        ];
    }
    result.url = jointQuery(url, result.query);
    return result;
};

const jointQuery = (url = '', query: SafeAny[]) => {
    //Joint query
    let search = '';
    query.forEach(val => {
        if (!(val.name && val.isRequired)) {
            return;
        }
        search += `${val.name}=${val.paramAttr?.example || ''}&`;
    });
    search = search ? `?${search.slice(0, -1)}` : '';
    return `${url.split('?')[0]}${search}`;
};


export function extractBraceContent(uri: string): string[] | null {
    // Regular expression to match content inside curly braces
    const regex = /{([^}]+)}/g
    let match: RegExpExecArray | null
    const results: string[] = []

    // Loop to find all matches
    while ((match = regex.exec(uri)) !== null) {
        // Add the matched content to the results array
        results.push(match[1])
    }

    // Return null if no matches were found
    return results.length > 0 ? results : null
}


export function mapContentTypeToApiBodyType(type: ContentType): ApiBodyType {
    const contentType =
        {
            'text/plain': ApiBodyType.Raw,
            'application/json': ApiBodyType.JSON,
            'application/xml': ApiBodyType.XML,
            'text/html': ApiBodyType.XML,
            'application/javascript': ApiBodyType.Raw,
            'application/x-www-form-urlencoded': ApiBodyType.FormData,
            'multipart/form-data': ApiBodyType.FormData
        }[type ?? 'text/plain'] ?? ApiBodyType.Raw
    return contentType
}

export function file2Base64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (): void => resolve(reader.result as string)
        reader.onerror = (error): void => reject(error)
    })
}