package com.admin.common.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import java.math.BigDecimal;

@Data
public class UserTunnelUpdateDto {

    @NotNull(message = "用户隧道权限ID不能为空")
    private Integer id;

    @NotNull(message = "流量限制不能为空")
    @Min(value = 0, message = "流量限制不能小于0")
    private Long flow;

    @NotNull(message = "转发数量不能为空")
    @Min(value = 0, message = "转发数量不能小于0")
    private Integer num;

    /**
     * 流量重置时间（时间戳）
     */
    @NotNull(message = "流量重置时间不能为空")
    private Long flowResetTime;

    /**
     * 到期时间（时间戳）
     */
    @NotNull(message = "到期时间不能为空")
    private Long expTime;

    @NotNull(message = "状态必选")
    private Integer status;

    /**
     * 限速规则ID（可选，null表示不限速）
     */
    private Integer speedId;

    /**
     * 计费模型：LEGACY/SUM/DOWNLOAD_ONLY/UPLOAD_ONLY/MAX
     */
    private String billingMode;

    /**
     * 流量倍率，为空时继承隧道配置
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "流量倍率必须大于0.0")
    @DecimalMax(value = "100.0", message = "流量倍率不能大于100.0")
    private BigDecimal trafficRatio;
}
