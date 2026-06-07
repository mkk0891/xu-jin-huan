package com.admin.service.impl;

import com.admin.common.dto.FlowLedgerQueryDto;
import com.admin.common.dto.FlowLedgerSummaryDto;
import com.admin.common.dto.FlowLedgerViewDto;
import com.admin.common.lang.R;
import com.admin.entity.FlowLedger;
import com.admin.mapper.FlowLedgerMapper;
import com.admin.service.FlowLedgerService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FlowLedgerServiceImpl extends ServiceImpl<FlowLedgerMapper, FlowLedger> implements FlowLedgerService {

    private static final long DEFAULT_CURRENT = 1L;
    private static final long DEFAULT_SIZE = 20L;
    private static final long MAX_SIZE = 200L;

    @Override
    public R getLedgerPage(FlowLedgerQueryDto queryDto) {
        FlowLedgerQueryDto normalizedQuery = normalizeQuery(queryDto);
        Page<FlowLedgerViewDto> page = new Page<>(normalizedQuery.getCurrent(), normalizedQuery.getSize());
        IPage<FlowLedgerViewDto> ledgerPage = baseMapper.selectLedgerPage(page, normalizedQuery);
        FlowLedgerSummaryDto summary = baseMapper.selectLedgerSummary(normalizedQuery);

        Map<String, Object> result = new HashMap<>();
        result.put("records", ledgerPage.getRecords());
        result.put("total", ledgerPage.getTotal());
        result.put("current", ledgerPage.getCurrent());
        result.put("size", ledgerPage.getSize());
        result.put("pages", ledgerPage.getPages());
        result.put("summary", summary == null ? new FlowLedgerSummaryDto() : summary);
        return R.ok(result);
    }

    @Override
    public R getLedgerSummary(FlowLedgerQueryDto queryDto) {
        FlowLedgerSummaryDto summary = baseMapper.selectLedgerSummary(normalizeQuery(queryDto));
        return R.ok(summary == null ? new FlowLedgerSummaryDto() : summary);
    }

    private FlowLedgerQueryDto normalizeQuery(FlowLedgerQueryDto queryDto) {
        FlowLedgerQueryDto query = queryDto == null ? new FlowLedgerQueryDto() : queryDto;
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
}
