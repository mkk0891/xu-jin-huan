package com.admin.common.dto;

import lombok.Data;

@Data
public class FlowLedgerQueryDto {

    private Long current = 1L;

    private Long size = 20L;

    private Integer userId;

    private Integer tunnelId;

    private Integer forwardId;

    private Long nodeId;

    private Integer userTunnelId;

    private String billingMode;

    private String serviceName;

    private String keyword;

    private Long startTime;

    private Long endTime;
}
