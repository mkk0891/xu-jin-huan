package com.admin.controller;

import com.admin.common.annotation.RequireRole;
import com.admin.common.aop.LogAnnotation;
import com.admin.common.dto.FlowLedgerQueryDto;
import com.admin.common.lang.R;
import com.admin.service.FlowLedgerService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/flow-ledger")
public class FlowLedgerController extends BaseController {

    @Resource
    private FlowLedgerService flowLedgerService;

    @LogAnnotation
    @RequireRole
    @PostMapping("/list")
    public R list(@Validated @RequestBody(required = false) FlowLedgerQueryDto queryDto) {
        return flowLedgerService.getLedgerPage(queryDto);
    }

    @LogAnnotation
    @RequireRole
    @PostMapping("/summary")
    public R summary(@Validated @RequestBody(required = false) FlowLedgerQueryDto queryDto) {
        return flowLedgerService.getLedgerSummary(queryDto);
    }
}
