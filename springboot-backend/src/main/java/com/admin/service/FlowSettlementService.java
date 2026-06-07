package com.admin.service;

import com.admin.common.dto.FlowSettlementQueryDto;
import com.admin.common.lang.R;
import com.admin.entity.FlowSettlement;
import com.admin.entity.User;
import com.admin.entity.UserTunnel;
import com.baomidou.mybatisplus.extension.service.IService;

public interface FlowSettlementService extends IService<FlowSettlement> {

    String TRIGGER_AUTO = "AUTO";

    String TRIGGER_MANUAL = "MANUAL";

    String SCOPE_USER = "USER";

    String SCOPE_USER_TUNNEL = "USER_TUNNEL";

    boolean settleAndResetUser(User user, String triggerType);

    boolean settleAndResetUserTunnel(UserTunnel userTunnel, String triggerType);

    R getSettlementPage(FlowSettlementQueryDto queryDto);

    R getSettlementSummary(FlowSettlementQueryDto queryDto);
}
