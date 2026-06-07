package com.admin.common.permission;

import lombok.Data;

@Data
public class PermissionCheckResult {

    private final boolean allowed;
    private final String reason;

    public static PermissionCheckResult allowed() {
        return new PermissionCheckResult(true, null);
    }

    public static PermissionCheckResult denied(String reason) {
        return new PermissionCheckResult(false, reason);
    }
}
