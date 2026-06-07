package com.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

@Data
public class FlowSettlement {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String scope;

    private Long targetId;

    private Long userId;

    private String userName;

    private Integer tunnelId;

    private String tunnelName;

    private Integer userTunnelId;

    private String triggerType;

    private Long inFlow;

    private Long outFlow;

    private Long totalFlow;

    private Long flowLimit;

    private Integer forwardLimit;

    private Long resetDay;

    private String periodKey;

    private Long settledTime;

    private Long createdTime;
}
