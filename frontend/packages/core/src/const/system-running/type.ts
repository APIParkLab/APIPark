import { EdgeConfig, NodeConfig } from "@antv/g6"

/**
 * 获取项目组拓扑关联关系列表接口请求
 */
export interface GetProjectGroupRelativeRequest {
    spaceId: string
  }
  
  /**
   * 获取项目组关联关系请求体
   */
  export interface ProjectGroupRelativeRequest {
    projectId: string
  }
  
  /**
   * 获取项目组关联关系返回体
   */
  export interface ProjectGroupRelativeResponse {
    success: boolean
    code: number
    message: string
    requestId: string
    data: Data
  }
  
  
  export interface Node {
    id: object
    workSpaceId: object
    projectId: string
    workSpaceName: string
    name: string
    status: number
    createTime: object
    updateTime: object
    // 可以配置任意 css
    labelCfg: unknown
  }
  
  export interface Edge {
    id: object
    startProjectId: string
    endProjectId: string
    status: number
    createTime: object
    updateTime: object
  }
  
  /**
   * 获取空间应用(项目组)关联关系请求体
   */
  export interface GetSpaceProjectGroupRelativeRequest {
    spaceId: string
  }
  
  /**
   * 获取空间应用（项目组）关联关系返回体
   */
  export interface GetSpaceProjectGroupRelativeResponse {
    success: boolean
    code: number
    message: string
    requestId: string
    data: Data
  }
  
  export interface GraphData {
    edges: EdgeConfig[]
    nodes: NodeData[]|NodeConfig[]
  }
  
  export interface Nodes {
    id: object
    workSpaceId: object
    projectId: string
    name: string
    status: number
    createTime: object
    workSpaceName: string
    updateTime: object
    // 可以配置任意 css
    labelCfg: unknown
  }
  
  export interface NodeClickItem {
    id: string
  }
  
  export interface Edge {
    id: object
    startProjectId: string
    endProjectId: string
    status: number
    createTime: object
    updateTime: object
  }
  
  /**
   * 获取项目组拓扑关联关系列表接口返回
   */
  export interface GetProjectGroupRelativeResponse {
    data: ProjectGroupRelativeItem[]
    success: boolean
    code: number
    message: string
    requestId: string
  }
  
  /**
   * 获取项目组拓扑关联关系列表数据
   */
  export interface ProjectGroupRelativeItem {
    // 这个返回字段有误解,实际对应的内容为项目组,反馈过但 java 那边发脾气没改
    projectId: string
    projectName: string
    upstreamCount: number
    workSpaceName: string
    downstreamCount: number
    id: number
  }
  
  /**
   * 侧边分组树节点的基本数据结构
   */
  export interface ProjectGroupTreeItem {
    groupDepth: number
    groupID: number | string
    groupName: string
    downstreamCount: number | string
    parentGroupID: number
    upstreamCount: number | string
    groupOrder: string
    groupPath: string
    showSelectedTag: boolean
  }
  
  /**
   * 视图枚举 global:全局视图
   *         part:局部视图（焦点视图)
   */
  export enum PictureTypeEnum {
    Global = 'global',
    Part = 'part'
  }
  
  export type RelativeItem = {
    label: string
    value: string
  }
  
  export type RelativeInfo = {
    name: string
    id: string
  }
  
  export interface RelativeListRequest {
    sourceProjectId: string
    targetProjectId: string
    sourceApiNodeIds?: number[]
    targetApiNodeIds?: number[]
  }
  
  export interface ApiRelativeResponse {
    success: boolean
    code: number
    message: string
    requestId: string
    data: Data
  }
  
  export interface Data {
    sourceApiList: SourceApiItem[]
    targetApiList: TargetApiItem[]
  }
  
  type TargetApiItem = SourceApiItem
  
  export interface SourceApiItem {
    id: number
    apiId: string
    projectId: object
    workspaceId: object
    name: string
    uri: string
    apiProtocol: string
    apiRequestType: string
    apiType: string
    previewPermission: number
    apiRelationPermission: number
    projectHashKey: string
    groupID: string
    spaceKey: string
  }
  
  export interface ApiRelativeCache {
    data: SourceApiItem[]
    total: number
  }
  
  
export type NodeData = {
    id: string
    selected?: boolean
    label: string
    name: string
    // 此节点是否为自身空间的样式
    isSelfSpace: boolean
    color?: string
    state?: string
    // 可以任意样式
    style?: unknown
    // 可以任意样式
    stateStyles?: unknown
    x?: number
    y?: number
    title?: string
    preRect?: {
      show: boolean
      width: number
      fill: string
      radius: number
    }
  }