import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/table";
import toast from "react-hot-toast";

import {
  getAllUsers,
  getFlowLedgerList,
  getForwardList,
  getNodeList,
  getTunnelList
} from "@/api";
import {
  BILLING_MODE_OPTIONS,
  FlowLedger,
  FlowLedgerQuery,
  FlowLedgerSummary,
  getBillingModeLabel
} from "@/types";

interface UserOption {
  id: number;
  user: string;
  name?: string;
}

interface NameOption {
  id: number;
  name: string;
}

const emptySummary: FlowLedgerSummary = {
  total: 0,
  rawInFlow: 0,
  rawOutFlow: 0,
  billedInFlow: 0,
  billedOutFlow: 0
};

const formatFlow = (value?: number | null): string => {
  const bytes = Math.abs(value || 0);
  const sign = (value || 0) < 0 ? "-" : "";
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${sign}${bytes} B`;
  if (bytes < 1024 * 1024) return `${sign}${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${sign}${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${sign}${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${sign}${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
};

const formatDateTime = (timestamp?: number | null): string => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
};

const localDateTimeToTimestamp = (value: string): number | null => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getBillingColor = (mode?: string) => {
  switch (mode) {
    case "SUM":
      return "primary" as const;
    case "DOWNLOAD_ONLY":
      return "success" as const;
    case "UPLOAD_ONLY":
      return "warning" as const;
    case "MAX":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

export default function FlowLedgerPage() {
  const [loading, setLoading] = useState(false);
  const [optionLoading, setOptionLoading] = useState(false);
  const [records, setRecords] = useState<FlowLedger[]>([]);
  const [summary, setSummary] = useState<FlowLedgerSummary>(emptySummary);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState<FlowLedgerQuery>({
    current: 1,
    size: 20,
    keyword: "",
    userId: null,
    tunnelId: null,
    forwardId: null,
    nodeId: null,
    billingMode: null,
    startTime: null,
    endTime: null
  });
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [tunnels, setTunnels] = useState<NameOption[]>([]);
  const [forwards, setForwards] = useState<NameOption[]>([]);
  const [nodes, setNodes] = useState<NameOption[]>([]);

  useEffect(() => {
    loadOptions();
    loadLedger(query);
  }, []);

  const billedTotal = useMemo(() => summary.billedInFlow + summary.billedOutFlow, [summary]);
  const rawTotal = useMemo(() => summary.rawInFlow + summary.rawOutFlow, [summary]);
  const billingDelta = billedTotal - rawTotal;
  const userOptions = useMemo(
    () => [{ id: "all", label: "全部用户" }, ...users.map(user => ({ id: user.id.toString(), label: user.name || user.user }))],
    [users]
  );
  const tunnelOptions = useMemo(
    () => [{ id: "all", label: "全部隧道" }, ...tunnels.map(tunnel => ({ id: tunnel.id.toString(), label: tunnel.name }))],
    [tunnels]
  );
  const forwardOptions = useMemo(
    () => [{ id: "all", label: "全部转发" }, ...forwards.map(forward => ({ id: forward.id.toString(), label: forward.name }))],
    [forwards]
  );
  const nodeOptions = useMemo(
    () => [{ id: "all", label: "全部节点" }, ...nodes.map(node => ({ id: node.id.toString(), label: node.name }))],
    [nodes]
  );
  const billingOptions = useMemo(
    () => [{ id: "all", label: "全部模型" }, ...BILLING_MODE_OPTIONS.map(option => ({ id: option.value, label: option.label }))],
    []
  );

  const buildQuery = (nextQuery: FlowLedgerQuery): FlowLedgerQuery => ({
    ...nextQuery,
    keyword: nextQuery.keyword?.trim() || "",
    startTime: localDateTimeToTimestamp(startDateTime),
    endTime: localDateTimeToTimestamp(endDateTime)
  });

  const loadOptions = async () => {
    setOptionLoading(true);
    try {
      const [userRes, tunnelRes, forwardRes, nodeRes] = await Promise.all([
        getAllUsers(),
        getTunnelList(),
        getForwardList(),
        getNodeList()
      ]);

      if (userRes.code === 0) setUsers(userRes.data || []);
      if (tunnelRes.code === 0) setTunnels(tunnelRes.data || []);
      if (forwardRes.code === 0) setForwards(forwardRes.data || []);
      if (nodeRes.code === 0) setNodes(nodeRes.data || []);
    } catch (error) {
      toast.error("筛选项加载失败");
    } finally {
      setOptionLoading(false);
    }
  };

  const loadLedger = async (nextQuery: FlowLedgerQuery) => {
    setLoading(true);
    try {
      const requestQuery = buildQuery(nextQuery);
      const res = await getFlowLedgerList(requestQuery);
      if (res.code === 0) {
        const data = res.data;
        setRecords(data?.records || []);
        setTotal(data?.total || 0);
        setPages(Math.max(data?.pages || 1, 1));
        setSummary(data?.summary || emptySummary);
      } else {
        toast.error(res.msg || "获取流量账本失败");
      }
    } catch (error) {
      toast.error("获取流量账本失败");
    } finally {
      setLoading(false);
    }
  };

  const updateQueryField = <K extends keyof FlowLedgerQuery>(key: K, value: FlowLedgerQuery[K]) => {
    setQuery(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const nextQuery = { ...query, current: 1 };
    setQuery(nextQuery);
    loadLedger(nextQuery);
  };

  const handleReset = () => {
    const nextQuery: FlowLedgerQuery = {
      current: 1,
      size: 20,
      keyword: "",
      userId: null,
      tunnelId: null,
      forwardId: null,
      nodeId: null,
      billingMode: null,
      startTime: null,
      endTime: null
    };
    setStartDateTime("");
    setEndDateTime("");
    setQuery(nextQuery);
    loadLedger(nextQuery);
  };

  const handlePageChange = (offset: number) => {
    const current = query.current || 1;
    const nextCurrent = Math.min(Math.max(current + offset, 1), pages);
    const nextQuery = { ...query, current: nextCurrent };
    setQuery(nextQuery);
    loadLedger(nextQuery);
  };

  const renderName = (name?: string | null, id?: number | null) => {
    if (name) return name;
    if (id) return `#${id}`;
    return "-";
  };

  return (
    <div className="px-3 lg:px-6 py-8 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
        <Input
          label="关键字"
          placeholder="用户、隧道、转发、节点或服务名"
          value={query.keyword || ""}
          onChange={(event) => updateQueryField("keyword", event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSearch()}
          variant="bordered"
          className="lg:max-w-xs"
        />

        <Select
          label="用户"
          selectedKeys={query.userId ? [query.userId.toString()] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("userId", value === "all" ? null : Number(value));
          }}
          variant="bordered"
          className="lg:max-w-xs"
          isLoading={optionLoading}
        >
          {userOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>

        <Select
          label="隧道"
          selectedKeys={query.tunnelId ? [query.tunnelId.toString()] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("tunnelId", value === "all" ? null : Number(value));
          }}
          variant="bordered"
          className="lg:max-w-xs"
          isLoading={optionLoading}
        >
          {tunnelOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>

        <Select
          label="计费模型"
          selectedKeys={query.billingMode ? [query.billingMode] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("billingMode", value === "all" ? null : value);
          }}
          variant="bordered"
          className="lg:max-w-xs"
        >
          {billingOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex flex-col xl:flex-row gap-3 xl:items-end">
        <Select
          label="转发"
          selectedKeys={query.forwardId ? [query.forwardId.toString()] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("forwardId", value === "all" ? null : Number(value));
          }}
          variant="bordered"
          className="xl:max-w-xs"
          isLoading={optionLoading}
        >
          {forwardOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>

        <Select
          label="节点"
          selectedKeys={query.nodeId ? [query.nodeId.toString()] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("nodeId", value === "all" ? null : Number(value));
          }}
          variant="bordered"
          className="xl:max-w-xs"
          isLoading={optionLoading}
        >
          {nodeOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>

        <Input
          label="开始时间"
          type="datetime-local"
          value={startDateTime}
          onChange={(event) => setStartDateTime(event.target.value)}
          variant="bordered"
          className="xl:max-w-xs"
        />

        <Input
          label="结束时间"
          type="datetime-local"
          value={endDateTime}
          onChange={(event) => setEndDateTime(event.target.value)}
          variant="bordered"
          className="xl:max-w-xs"
        />

        <div className="flex gap-2">
          <Button color="primary" onPress={handleSearch} isLoading={loading}>
            查询
          </Button>
          <Button variant="flat" onPress={handleReset}>
            重置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">账本记录</span>
            <span className="text-xl font-semibold text-foreground">{summary.total}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">原始流量合计</span>
            <span className="text-xl font-semibold text-foreground">{formatFlow(rawTotal)}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">计费流量合计</span>
            <span className="text-xl font-semibold text-primary">{formatFlow(billedTotal)}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">计费差额</span>
            <span className={`text-xl font-semibold ${billingDelta >= 0 ? "text-warning" : "text-success"}`}>
              {billingDelta >= 0 ? "+" : ""}{formatFlow(billingDelta)}
            </span>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-divider shadow-sm">
        <CardBody>
          <div className="overflow-x-auto">
            <Table aria-label="流量账本列表" removeWrapper>
              <TableHeader>
                <TableColumn>时间</TableColumn>
                <TableColumn>用户</TableColumn>
                <TableColumn>隧道 / 转发</TableColumn>
                <TableColumn>节点</TableColumn>
                <TableColumn>原始流量</TableColumn>
                <TableColumn>计费流量</TableColumn>
                <TableColumn>计费模型</TableColumn>
                <TableColumn>服务名</TableColumn>
              </TableHeader>
              <TableBody
                items={records}
                isLoading={loading}
                loadingContent={<Spinner size="sm" />}
                emptyContent="暂无流量账本记录"
              >
                {(ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell>
                      <div className="min-w-36 text-small">{formatDateTime(ledger.createdTime)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-28">
                        <span className="font-medium">{renderName(ledger.userName, ledger.userId)}</span>
                        <span className="text-tiny text-default-500">ID {ledger.userId || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-40">
                        <span>{renderName(ledger.tunnelName, ledger.tunnelId)}</span>
                        <span className="text-tiny text-default-500">{renderName(ledger.forwardName, ledger.forwardId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderName(ledger.nodeName, ledger.nodeId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-32 text-small">
                        <span>入 {formatFlow(ledger.rawInFlow)}</span>
                        <span>出 {formatFlow(ledger.rawOutFlow)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-32 text-small font-medium">
                        <span>入 {formatFlow(ledger.billedInFlow)}</span>
                        <span>出 {formatFlow(ledger.billedOutFlow)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-28">
                        <Chip color={getBillingColor(ledger.billingMode)} variant="flat" size="sm">
                          {getBillingModeLabel(ledger.billingMode)}
                        </Chip>
                        <span className="text-tiny text-default-500">倍率 {ledger.trafficRatio || 1}x</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-tiny">{ledger.serviceName || "-"}</span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <span className="text-small text-default-500">
              第 {query.current || 1} / {pages} 页，共 {total} 条
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={(query.current || 1) <= 1 || loading}
                onPress={() => handlePageChange(-1)}
              >
                上一页
              </Button>
              <Button
                size="sm"
                variant="flat"
                isDisabled={(query.current || 1) >= pages || loading}
                onPress={() => handlePageChange(1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
