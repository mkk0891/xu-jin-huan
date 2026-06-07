package com.admin.service;

import com.admin.common.permission.PermissionCheckResult;
import com.admin.entity.User;
import com.admin.entity.UserTunnel;

public interface PermissionPolicyService {

    PermissionCheckResult checkUserRuntime(User user);

    PermissionCheckResult checkUserTunnelRuntime(UserTunnel userTunnel);
}
