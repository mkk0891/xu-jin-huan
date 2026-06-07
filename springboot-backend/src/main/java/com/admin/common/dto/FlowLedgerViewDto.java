package com.admin.common.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FlowLedgerViewDto {

    private Long id;

    private Long nodeId;

    private String nodeName;

    private Long forwardId;

    private String forwardName;

    private Integer userId;

    private String userName;

    private Integer tunnelId;

    private String tunnelName;

    private Integer userTunnelId;

    private Long rawInFlow;

    private Long rawOutFlow;

    private Long billedInFlow;

    private Long billedOutFlow;

    private String billingMode;

    private BigDecimal trafficRatio;

    private String serviceName;

    private Long createdTime;
}
