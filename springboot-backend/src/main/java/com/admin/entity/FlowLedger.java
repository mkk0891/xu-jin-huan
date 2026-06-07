package com.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FlowLedger {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long nodeId;

    private Long forwardId;

    private Integer userId;

    private Integer tunnelId;

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
