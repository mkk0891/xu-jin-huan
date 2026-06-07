package com.admin.controller;

import com.admin.common.annotation.RequireRole;
import com.admin.common.aop.LogAnnotation;
import com.admin.common.dto.FlowSettlementQueryDto;
import com.admin.common.lang.R;
import com.admin.service.FlowSettlementService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/flow-settlement")
public class FlowSettlementController extends BaseController {

    @Resource
    private FlowSettlementService flowSettlementService;

    @LogAnnotation
    @RequireRole
    @PostMapping("/list")
    public R list(@Validated @RequestBody(required = false) FlowSettlementQueryDto queryDto) {
        return flowSettlementService.getSettlementPage(queryDto);
    }

    @LogAnnotation
    @RequireRole
    @PostMapping("/summary")
    public R summary(@Validated @RequestBody(required = false) FlowSettlementQueryDto queryDto) {
        return flowSettlementService.getSettlementSummary(queryDto);
    }
}
