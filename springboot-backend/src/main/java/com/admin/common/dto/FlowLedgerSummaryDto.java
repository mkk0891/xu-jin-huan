package com.admin.common.dto;

import lombok.Data;

@Data
public class FlowLedgerSummaryDto {

    private Long total = 0L;

    private Long rawInFlow = 0L;

    private Long rawOutFlow = 0L;

    private Long billedInFlow = 0L;

    private Long billedOutFlow = 0L;
}
