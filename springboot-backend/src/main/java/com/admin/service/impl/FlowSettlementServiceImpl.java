package com.admin.service.impl;

import com.admin.common.dto.FlowSettlementQueryDto;
import com.admin.common.dto.FlowSettlementSummaryDto;
import com.admin.common.dto.FlowSettlementViewDto;
import com.admin.common.lang.R;
import com.admin.entity.FlowSettlement;
import com.admin.entity.Tunnel;
import com.admin.entity.User;
import com.admin.entity.UserTunnel;
import com.admin.mapper.FlowSettlementMapper;
import com.admin.mapper.TunnelMapper;
import com.admin.mapper.UserMapper;
import com.admin.mapper.UserTunnelMapper;
import com.admin.service.FlowSettlementService;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class FlowSettlementServiceImpl extends ServiceImpl<FlowSettlementMapper, FlowSettlement> implements FlowSettlementService {

    private static final long DEFAULT_CURRENT = 1L;
    private static final long DEFAULT_SIZE = 20L;
    private static final long MAX_SIZE = 200L;

    @Resource
    private UserMapper userMapper;

    @Resource
    private UserTunnelMapper userTunnelMapper;

    @Resource
    private TunnelMapper tunnelMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean settleAndResetUser(User user, String triggerType) {
        if (user == null || user.getId() == null) {
            return false;
        }

        FlowSettlement settlement = new FlowSettlement();
        settlement.setScope(SCOPE_USER);
        settlement.setTargetId(user.getId());
        settlement.setUserId(user.getId());
        settlement.setUserName(user.getUser());
        settlement.setTriggerType(normalizeTriggerType(triggerType));
        settlement.setInFlow(safe(user.getInFlow()));
        settlement.setOutFlow(safe(user.getOutFlow()));
        settlement.setTotalFlow(safe(user.getInFlow()) + safe(user.getOutFlow()));
        settlement.setFlowLimit(user.getFlow());
        settlement.setForwardLimit(user.getNum());
        settlement.setResetDay(user.getFlowResetTime());
        fillTimeFields(settlement);

        baseMapper.insert(settlement);

        UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", user.getId())
                .setSql("in_flow = 0, out_flow = 0");
        return userMapper.update(null, updateWrapper) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean settleAndResetUserTunnel(UserTunnel userTunnel, String triggerType) {
        if (userTunnel == null || userTunnel.getId() == null) {
            return false;
        }

        User user = userTunnel.getUserId() == null ? null : userMapper.selectById(userTunnel.getUserId());
        Tunnel tunnel = userTunnel.getTunnelId() == null ? null : tunnelMapper.selectById(userTunnel.getTunnelId());

        FlowSettlement settlement = new FlowSettlement();
        settlement.setScope(SCOPE_USER_TUNNEL);
        settlement.setTargetId(userTunnel.getId().longValue());
        settlement.setUserId(userTunnel.getUserId() == null ? null : userTunnel.getUserId().longValue());
        settlement.setUserName(user == null ? null : user.getUser());
        settlement.setTunnelId(userTunnel.getTunnelId());
        settlement.setTunnelName(tunnel == null ? null : tunnel.getName());
        settlement.setUserTunnelId(userTunnel.getId());
        settlement.setTriggerType(normalizeTriggerType(triggerType));
        settlement.setInFlow(safe(userTunnel.getInFlow()));
        settlement.setOutFlow(safe(userTunnel.getOutFlow()));
        settlement.setTotalFlow(safe(userTunnel.getInFlow()) + safe(userTunnel.getOutFlow()));
        settlement.setFlowLimit(userTunnel.getFlow());
        settlement.setForwardLimit(userTunnel.getNum());
        settlement.setResetDay(userTunnel.getFlowResetTime());
        fillTimeFields(settlement);

        baseMapper.insert(settlement);

        UpdateWrapper<UserTunnel> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", userTunnel.getId())
                .setSql("in_flow = 0, out_flow = 0");
        return userTunnelMapper.update(null, updateWrapper) > 0;
    }

    @Override
    public R getSettlementPage(FlowSettlementQueryDto queryDto) {
        FlowSettlementQueryDto normalizedQuery = normalizeQuery(queryDto);
        Page<FlowSettlementViewDto> page = new Page<>(normalizedQuery.getCurrent(), normalizedQuery.getSize());
        IPage<FlowSettlementViewDto> settlementPage = baseMapper.selectSettlementPage(page, normalizedQuery);
        FlowSettlementSummaryDto summary = baseMapper.selectSettlementSummary(normalizedQuery);

        Map<String, Object> result = new HashMap<>();
        result.put("records", settlementPage.getRecords());
        result.put("total", settlementPage.getTotal());
        result.put("current", settlementPage.getCurrent());
        result.put("size", settlementPage.getSize());
        result.put("pages", settlementPage.getPages());
        result.put("summary", summary == null ? new FlowSettlementSummaryDto() : summary);
        return R.ok(result);
    }

    @Override
    public R getSettlementSummary(FlowSettlementQueryDto queryDto) {
        FlowSettlementSummaryDto summary = baseMapper.selectSettlementSummary(normalizeQuery(queryDto));
        return R.ok(summary == null ? new FlowSettlementSummaryDto() : summary);
    }

    private FlowSettlementQueryDto normalizeQuery(FlowSettlementQueryDto queryDto) {
        FlowSettlementQueryDto query = queryDto == null ? new FlowSettlementQueryDto() : queryDto;
        if (query.getCurrent() == null || query.getCurrent() < 1) {
            query.setCurrent(DEFAULT_CURRENT);
        }
        if (query.getSize() == null || query.getSize() < 1) {
            query.setSize(DEFAULT_SIZE);
        }
        if (query.getSize() > MAX_SIZE) {
            query.setSize(MAX_SIZE);
        }
        return query;
    }

    private void fillTimeFields(FlowSettlement settlement) {
        long now = System.currentTimeMillis();
        settlement.setSettledTime(now);
        settlement.setCreatedTime(now);
        settlement.setPeriodKey(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
    }

    private String normalizeTriggerType(String triggerType) {
        return TRIGGER_MANUAL.equals(triggerType) ? TRIGGER_MANUAL : TRIGGER_AUTO;
    }

    private long safe(Long value) {
        return value == null ? 0L : value;
    }
}
