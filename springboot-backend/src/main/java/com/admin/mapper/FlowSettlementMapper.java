package com.admin.mapper;

import com.admin.common.dto.FlowSettlementQueryDto;
import com.admin.common.dto.FlowSettlementSummaryDto;
import com.admin.common.dto.FlowSettlementViewDto;
import com.admin.entity.FlowSettlement;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

public interface FlowSettlementMapper extends BaseMapper<FlowSettlement> {

    IPage<FlowSettlementViewDto> selectSettlementPage(Page<FlowSettlementViewDto> page, @Param("query") FlowSettlementQueryDto query);

    FlowSettlementSummaryDto selectSettlementSummary(@Param("query") FlowSettlementQueryDto query);
}
