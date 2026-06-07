package com.admin.common.billing;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BillingResult {
    private final long inFlow;
    private final long outFlow;
    private final BillingMode billingMode;
    private final BigDecimal trafficRatio;
}
