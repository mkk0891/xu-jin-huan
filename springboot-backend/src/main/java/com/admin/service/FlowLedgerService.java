package com.admin.service;

import com.admin.common.dto.FlowLedgerQueryDto;
import com.admin.common.lang.R;
import com.admin.entity.FlowLedger;
import com.baomidou.mybatisplus.extension.service.IService;

public interface FlowLedgerService extends IService<FlowLedger> {

    R getLedgerPage(FlowLedgerQueryDto queryDto);

    R getLedgerSummary(FlowLedgerQueryDto queryDto);
}
