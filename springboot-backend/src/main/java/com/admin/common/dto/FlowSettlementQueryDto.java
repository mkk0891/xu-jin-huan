package com.admin.common.dto;

import lombok.Data;

@Data
public class FlowSettlementQueryDto {

    private Long current = 1L;

    private Long size = 20L;

    private String scope;

    private String triggerType;

    private Long userId;

    private Integer tunnelId;

    private Integer userTunnelId;

    private String keyword;

    private Long startTime;

    private Long endTime;
}
