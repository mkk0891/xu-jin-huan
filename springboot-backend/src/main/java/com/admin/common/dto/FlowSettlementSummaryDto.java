package com.admin.common.dto;

import lombok.Data;

@Data
public class FlowSettlementSummaryDto {

    private Long total = 0L;

    private Long inFlow = 0L;

    private Long outFlow = 0L;

    private Long totalFlow = 0L;
}
