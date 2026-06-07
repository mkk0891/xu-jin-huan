package com.admin.common.billing;

import com.admin.common.dto.FlowDto;
import com.admin.entity.Tunnel;
import com.admin.entity.UserTunnel;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BillingCalculator {

    public BillingResult calculate(FlowDto rawFlow, Tunnel tunnel, UserTunnel userTunnel) {
        long download = safe(rawFlow.getD());
        long upload = safe(rawFlow.getU());
        BillingMode mode = resolveMode(tunnel, userTunnel);
        BigDecimal ratio = resolveRatio(tunnel, userTunnel);

        switch (mode) {
            case DOWNLOAD_ONLY:
                return new BillingResult(applyRatio(download, ratio), 0L, mode, ratio);
            case UPLOAD_ONLY:
                return new BillingResult(0L, applyRatio(upload, ratio), mode, ratio);
            case MAX:
                return new BillingResult(applyRatio(Math.max(download, upload), ratio), 0L, mode, ratio);
            case SUM:
                return new BillingResult(applyRatio(download, ratio), applyRatio(upload, ratio), mode, ratio);
            case LEGACY:
            default:
                int flowType = tunnel == null ? 2 : tunnel.getFlow();
                return new BillingResult(applyRatio(download, ratio) * flowType, applyRatio(upload, ratio) * flowType, mode, ratio);
        }
    }

    private BillingMode resolveMode(Tunnel tunnel, UserTunnel userTunnel) {
        if (userTunnel != null && userTunnel.getBillingMode() != null && !userTunnel.getBillingMode().isEmpty()) {
            return parseMode(userTunnel.getBillingMode());
        }
        if (tunnel != null && tunnel.getBillingMode() != null && !tunnel.getBillingMode().isEmpty()) {
            return parseMode(tunnel.getBillingMode());
        }
        return BillingMode.LEGACY;
    }

    private BillingMode parseMode(String value) {
        try {
            return BillingMode.valueOf(value);
        } catch (Exception e) {
            return BillingMode.LEGACY;
        }
    }

    private BigDecimal resolveRatio(Tunnel tunnel, UserTunnel userTunnel) {
        if (userTunnel != null && userTunnel.getTrafficRatio() != null) {
            return userTunnel.getTrafficRatio();
        }
        if (tunnel != null && tunnel.getTrafficRatio() != null) {
            return tunnel.getTrafficRatio();
        }
        return BigDecimal.ONE;
    }

    private long applyRatio(long value, BigDecimal ratio) {
        return BigDecimal.valueOf(value).multiply(ratio).longValue();
    }

    private long safe(Long value) {
        return value == null ? 0L : value;
    }
}
