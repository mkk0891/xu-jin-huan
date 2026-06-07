package com.admin.service.impl;

import com.admin.common.permission.PermissionCheckResult;
import com.admin.entity.User;
import com.admin.entity.UserTunnel;
import com.admin.service.PermissionPolicyService;
import org.springframework.stereotype.Service;

@Service
public class PermissionPolicyServiceImpl implements PermissionPolicyService {

    private static final long BYTES_TO_GB = 1024L * 1024L * 1024L;

    @Override
    public PermissionCheckResult checkUserRuntime(User user) {
        if (user == null) {
            return PermissionCheckResult.allowed();
        }

        long flowLimit = user.getFlow() * BYTES_TO_GB;
        long currentFlow = safe(user.getInFlow()) + safe(user.getOutFlow());
        if (flowLimit < currentFlow) {
            return PermissionCheckResult.denied("USER_FLOW_EXCEEDED");
        }

        if (user.getExpTime() != null && user.getExpTime() <= System.currentTimeMillis()) {
            return PermissionCheckResult.denied("USER_EXPIRED");
        }

        if (user.getStatus() != 1) {
            return PermissionCheckResult.denied("USER_DISABLED");
        }

        return PermissionCheckResult.allowed();
    }

    @Override
    public PermissionCheckResult checkUserTunnelRuntime(UserTunnel userTunnel) {
        if (userTunnel == null) {
            return PermissionCheckResult.allowed();
        }

        long currentFlow = safe(userTunnel.getInFlow()) + safe(userTunnel.getOutFlow());
        if (currentFlow >= userTunnel.getFlow() * BYTES_TO_GB) {
            return PermissionCheckResult.denied("USER_TUNNEL_FLOW_EXCEEDED");
        }

        if (userTunnel.getExpTime() != null && userTunnel.getExpTime() <= System.currentTimeMillis()) {
            return PermissionCheckResult.denied("USER_TUNNEL_EXPIRED");
        }

        if (userTunnel.getStatus() != 1) {
            return PermissionCheckResult.denied("USER_TUNNEL_DISABLED");
        }

        return PermissionCheckResult.allowed();
    }

    private long safe(Long value) {
        return value == null ? 0L : value;
    }
}
