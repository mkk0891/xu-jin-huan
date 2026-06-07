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
  getFlowSettlementList,
  getTunnelList
} from "@/api";
import {
  FlowSettlement,
  FlowSettlementQuery,
  FlowSettlementSummary
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

const emptySummary: FlowSettlementSummary = {
  total: 0,
  inFlow: 0,
  outFlow: 0,
  totalFlow: 0
};

const scopeOptions = [
  { id: "all", label: "全部维度" },
  { id: "USER", label: "用户总量" },
  { id: "USER_TUNNEL", label: "隧道权限" }
];

const triggerOptions = [
  { id: "all", label: "全部触发" },
  { id: "AUTO", label: "自动周期" },
  { id: "MANUAL", label: "手动清零" }
];

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

const formatLimit = (value?: number | null): string => {
  if (value === null || value === undefined) return "-";
  return `${value} GB`;
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

const getScopeLabel = (scope?: string | null) => {
  if (scope === "USER") return "用户总量";
  if (scope === "USER_TUNNEL") return "隧道权限";
  return scope || "-";
};

const getTriggerLabel = (triggerType?: string | null) => {
  if (triggerType === "AUTO") return "自动周期";
  if (triggerType === "MANUAL") return "手动清零";
  return triggerType || "-";
};

const getScopeColor = (scope?: string | null) => {
  return scope === "USER_TUNNEL" ? "secondary" as const : "primary" as const;
};

const getTriggerColor = (triggerType?: string | null) => {
  return triggerType === "MANUAL" ? "warning" as const : "success" as const;
};

const renderName = (name?: string | null, id?: number | null) => {
  if (name) return name;
  if (id) return `#${id}`;
  return "-";
};

const renderResetDay = (resetDay?: number | null) => {
  if (resetDay === null || resetDay === undefined) return "-";
  return resetDay === 0 ? "不重置" : `每月${resetDay}号`;
};

export default function FlowSettlementPage() {
  const [loading, setLoading] = useState(false);
  const [optionLoading, setOptionLoading] = useState(false);
  const [records, setRecords] = useState<FlowSettlement[]>([]);
  const [summary, setSummary] = useState<FlowSettlementSummary>(emptySummary);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState<FlowSettlementQuery>({
    current: 1,
    size: 20,
    keyword: "",
    userId: null,
    tunnelId: null,
    scope: null,
    triggerType: null,
    startTime: null,
    endTime: null
  });
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [tunnels, setTunnels] = useState<NameOption[]>([]);

  useEffect(() => {
    loadOptions();
    loadSettlements(query);
  }, []);

  const userOptions = useMemo(
    () => [{ id: "all", label: "全部用户" }, ...users.map(user => ({ id: user.id.toString(), label: user.name || user.user }))],
    [users]
  );
  const tunnelOptions = useMemo(
    () => [{ id: "all", label: "全部隧道" }, ...tunnels.map(tunnel => ({ id: tunnel.id.toString(), label: tunnel.name }))],
    [tunnels]
  );

  const buildQuery = (nextQuery: FlowSettlementQuery): FlowSettlementQuery => ({
    ...nextQuery,
    keyword: nextQuery.keyword?.trim() || "",
    startTime: localDateTimeToTimestamp(startDateTime),
    endTime: localDateTimeToTimestamp(endDateTime)
  });

  const loadOptions = async () => {
    setOptionLoading(true);
    try {
      const [userRes, tunnelRes] = await Promise.all([
        getAllUsers(),
        getTunnelList()
      ]);

      if (userRes.code === 0) setUsers(userRes.data || []);
      if (tunnelRes.code === 0) setTunnels(tunnelRes.data || []);
    } catch (error) {
      toast.error("筛选项加载失败");
    } finally {
      setOptionLoading(false);
    }
  };

  const loadSettlements = async (nextQuery: FlowSettlementQuery) => {
    setLoading(true);
    try {
      const requestQuery = buildQuery(nextQuery);
      const res = await getFlowSettlementList(requestQuery);
      if (res.code === 0) {
        const data = res.data;
        setRecords(data?.records || []);
        setTotal(data?.total || 0);
        setPages(Math.max(data?.pages || 1, 1));
        setSummary(data?.summary || emptySummary);
      } else {
        toast.error(res.msg || "获取结算记录失败");
      }
    } catch (error) {
      toast.error("获取结算记录失败");
    } finally {
      setLoading(false);
    }
  };

  const updateQueryField = <K extends keyof FlowSettlementQuery>(key: K, value: FlowSettlementQuery[K]) => {
    setQuery(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const nextQuery = { ...query, current: 1 };
    setQuery(nextQuery);
    loadSettlements(nextQuery);
  };

  const handleReset = () => {
    const nextQuery: FlowSettlementQuery = {
      current: 1,
      size: 20,
      keyword: "",
      userId: null,
      tunnelId: null,
      userTunnelId: null,
      scope: null,
      triggerType: null,
      startTime: null,
      endTime: null
    };
    setStartDateTime("");
    setEndDateTime("");
    setQuery(nextQuery);
    loadSettlements(nextQuery);
  };

  const handlePageChange = (offset: number) => {
    const current = query.current || 1;
    const nextCurrent = Math.min(Math.max(current + offset, 1), pages);
    const nextQuery = { ...query, current: nextCurrent };
    setQuery(nextQuery);
    loadSettlements(nextQuery);
  };

  return (
    <div className="px-3 lg:px-6 py-8 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
        <Input
          label="关键字"
          placeholder="用户、隧道或周期"
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
          label="结算维度"
          selectedKeys={query.scope ? [query.scope] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("scope", value === "all" ? null : value);
          }}
          variant="bordered"
          className="lg:max-w-xs"
        >
          {scopeOptions.map(option => (
            <SelectItem key={option.id}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex flex-col xl:flex-row gap-3 xl:items-end">
        <Select
          label="触发方式"
          selectedKeys={query.triggerType ? [query.triggerType] : ["all"]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateQueryField("triggerType", value === "all" ? null : value);
          }}
          variant="bordered"
          className="xl:max-w-xs"
        >
          {triggerOptions.map(option => (
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
            <span className="text-small text-default-500">结算记录</span>
            <span className="text-xl font-semibold text-foreground">{summary.total}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">入站快照</span>
            <span className="text-xl font-semibold text-foreground">{formatFlow(summary.inFlow)}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">出站快照</span>
            <span className="text-xl font-semibold text-foreground">{formatFlow(summary.outFlow)}</span>
          </CardBody>
        </Card>
        <Card className="border border-divider shadow-sm">
          <CardBody className="gap-1">
            <span className="text-small text-default-500">清零前总量</span>
            <span className="text-xl font-semibold text-primary">{formatFlow(summary.totalFlow)}</span>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-divider shadow-sm">
        <CardBody>
          <div className="overflow-x-auto">
            <Table aria-label="结算记录列表" removeWrapper>
              <TableHeader>
                <TableColumn>结算时间</TableColumn>
                <TableColumn>维度</TableColumn>
                <TableColumn>用户</TableColumn>
                <TableColumn>隧道权限</TableColumn>
                <TableColumn>快照流量</TableColumn>
                <TableColumn>额度限制</TableColumn>
                <TableColumn>周期</TableColumn>
                <TableColumn>触发方式</TableColumn>
              </TableHeader>
              <TableBody
                items={records}
                isLoading={loading}
                loadingContent={<Spinner size="sm" />}
                emptyContent="暂无结算记录"
              >
                {(settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell>
                      <div className="min-w-36 text-small">{formatDateTime(settlement.settledTime)}</div>
                    </TableCell>
                    <TableCell>
                      <Chip color={getScopeColor(settlement.scope)} variant="flat" size="sm">
                        {getScopeLabel(settlement.scope)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-28">
                        <span className="font-medium">{renderName(settlement.userName, settlement.userId)}</span>
                        <span className="text-tiny text-default-500">ID {settlement.userId || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-36">
                        <span>{settlement.scope === "USER_TUNNEL" ? renderName(settlement.tunnelName, settlement.tunnelId) : "-"}</span>
                        <span className="text-tiny text-default-500">权限 ID {settlement.userTunnelId || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-32 text-small">
                        <span>入 {formatFlow(settlement.inFlow)}</span>
                        <span>出 {formatFlow(settlement.outFlow)}</span>
                        <span className="font-medium text-primary">合计 {formatFlow(settlement.totalFlow)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-28 text-small">
                        <span>流量 {formatLimit(settlement.flowLimit)}</span>
                        <span>转发 {settlement.forwardLimit ?? "-"} 个</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-24 text-small">
                        <span>{settlement.periodKey || "-"}</span>
                        <span className="text-tiny text-default-500">{renderResetDay(settlement.resetDay)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color={getTriggerColor(settlement.triggerType)} variant="flat" size="sm">
                        {getTriggerLabel(settlement.triggerType)}
                      </Chip>
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
