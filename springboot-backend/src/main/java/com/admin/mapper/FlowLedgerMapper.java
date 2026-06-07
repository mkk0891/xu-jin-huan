package com.admin.mapper;

import com.admin.common.dto.FlowLedgerQueryDto;
import com.admin.common.dto.FlowLedgerSummaryDto;
import com.admin.common.dto.FlowLedgerViewDto;
import com.admin.entity.FlowLedger;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

public interface FlowLedgerMapper extends BaseMapper<FlowLedger> {

    IPage<FlowLedgerViewDto> selectLedgerPage(Page<FlowLedgerViewDto> page, @Param("query") FlowLedgerQueryDto query);

    FlowLedgerSummaryDto selectLedgerSummary(@Param("query") FlowLedgerQueryDto query);
}
