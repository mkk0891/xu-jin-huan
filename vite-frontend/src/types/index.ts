import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// 用户管理相关类型
export interface User {
  id: number;
  name?: string;
  user: string;
  pwd?: string;
  status: number; // 1-正常, 0-禁用
  flow: number; // 流量限制(GB)
  num: number; // 转发数量
  expTime?: number; // 过期时间戳
  flowResetTime?: number; // 流量重置日期(1-31号)
  createdTime?: number; // 创建时间戳
  inFlow?: number; // 下载流量(字节)
  outFlow?: number; // 上传流量(字节)
}

export interface UserForm {
  id?: number;
  name?: string;
  user: string;
  pwd?: string;
  status: number;
  flow: number;
  num: number;
  expTime: Date | null;
  flowResetTime: number;
}

export interface UserTunnel {
  id: number;
  userId: number;
  tunnelId: number;
  tunnelName: string;
  status: number; // 1-正常, 0-禁用
  flow: number; // 流量限制(GB)
  num: number; // 转发数量
  expTime: number; // 过期时间戳
  flowResetTime: number; // 流量重置日期
  speedId?: number | null; // 限速规则ID
  speedLimitName?: string; // 限速规则名称
  inFlow?: number; // 下载流量(字节)
  outFlow?: number; // 上传流量(字节)
  tunnelFlow?: number; // 隧道流量计算类型(1-单向, 2-双向)
  billingMode?: BillingMode | null; // 计费模型
  trafficRatio?: number | null; // 流量倍率，为空则继承隧道配置
}

export interface UserTunnelForm {
  tunnelId: number | null;
  flow: number;
  num: number;
  expTime: Date | null;
  flowResetTime: number;
  speedId: number | null;
  billingMode: BillingMode | null;
  trafficRatio: number | null;
}

export interface Tunnel {
  id: number;
  name: string;
  entryNodeId: number;
  exitNodeId: number;
  entryNodeName?: string;
  exitNodeName?: string;
  status?: number;
  flow?: number; // 流量计算类型
  billingMode?: BillingMode | null; // 计费模型
  trafficRatio?: number | null; // 流量倍率
}

export interface SpeedLimit {
  id: number;
  name: string;
  tunnelId: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

export interface Pagination {
  current: number;
  size: number;
  total: number;
}

export type BillingMode = "LEGACY" | "SUM" | "DOWNLOAD_ONLY" | "UPLOAD_ONLY" | "MAX";

export const BILLING_MODE_OPTIONS: Array<{ value: BillingMode; label: string }> = [
  { value: "LEGACY", label: "兼容旧算法" },
  { value: "SUM", label: "上下行合计" },
  { value: "DOWNLOAD_ONLY", label: "仅下载" },
  { value: "UPLOAD_ONLY", label: "仅上传" },
  { value: "MAX", label: "取较大值" }
];

export const getBillingModeLabel = (mode?: string | null) => {
  return BILLING_MODE_OPTIONS.find(item => item.value === mode)?.label || "继承配置";
};

export interface FlowLedger {
  id: number;
  nodeId?: number | null;
  nodeName?: string | null;
  forwardId?: number | null;
  forwardName?: string | null;
  userId?: number | null;
  userName?: string | null;
  tunnelId?: number | null;
  tunnelName?: string | null;
  userTunnelId?: number | null;
  rawInFlow: number;
  rawOutFlow: number;
  billedInFlow: number;
  billedOutFlow: number;
  billingMode: BillingMode | string;
  trafficRatio: number;
  serviceName?: string | null;
  createdTime: number;
}

export interface FlowLedgerSummary {
  total: number;
  rawInFlow: number;
  rawOutFlow: number;
  billedInFlow: number;
  billedOutFlow: number;
}

export interface FlowLedgerQuery {
  current?: number;
  size?: number;
  userId?: number | null;
  tunnelId?: number | null;
  forwardId?: number | null;
  nodeId?: number | null;
  userTunnelId?: number | null;
  billingMode?: string | null;
  serviceName?: string;
  keyword?: string;
  startTime?: number | null;
  endTime?: number | null;
}

export interface FlowLedgerPage {
  records: FlowLedger[];
  total: number;
  current: number;
  size: number;
  pages: number;
  summary: FlowLedgerSummary;
}

export type FlowSettlementScope = "USER" | "USER_TUNNEL";
export type FlowSettlementTriggerType = "AUTO" | "MANUAL";

export interface FlowSettlement {
  id: number;
  scope: FlowSettlementScope | string;
  targetId?: number | null;
  userId?: number | null;
  userName?: string | null;
  tunnelId?: number | null;
  tunnelName?: string | null;
  userTunnelId?: number | null;
  triggerType: FlowSettlementTriggerType | string;
  inFlow: number;
  outFlow: number;
  totalFlow: number;
  flowLimit?: number | null;
  forwardLimit?: number | null;
  resetDay?: number | null;
  periodKey?: string | null;
  settledTime: number;
  createdTime?: number | null;
}

export interface FlowSettlementSummary {
  total: number;
  inFlow: number;
  outFlow: number;
  totalFlow: number;
}

export interface FlowSettlementQuery {
  current?: number;
  size?: number;
  scope?: string | null;
  triggerType?: string | null;
  userId?: number | null;
  tunnelId?: number | null;
  userTunnelId?: number | null;
  keyword?: string;
  startTime?: number | null;
  endTime?: number | null;
}

export interface FlowSettlementPage {
  records: FlowSettlement[];
  total: number;
  current: number;
  size: number;
  pages: number;
  summary: FlowSettlementSummary;
}
