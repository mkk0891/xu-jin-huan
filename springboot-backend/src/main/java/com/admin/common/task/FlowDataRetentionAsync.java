package com.admin.common.task;

import com.admin.entity.FlowLedger;
import com.admin.entity.FlowSettlement;
import com.admin.service.FlowLedgerService;
import com.admin.service.FlowSettlementService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

@Slf4j
@Configuration
@EnableScheduling
public class FlowDataRetentionAsync {

    @Resource
    private FlowLedgerService flowLedgerService;

    @Resource
    private FlowSettlementService flowSettlementService;

    @Value("${flow.retention.ledger-days:3}")
    private long ledgerRetentionDays;

    @Value("${flow.retention.settlement-days:60}")
    private long settlementRetentionDays;

    @Value("${flow.retention.cleanup-on-start:true}")
    private boolean cleanupOnStart;

    @PostConstruct
    public void cleanupOnStart() {
        if (cleanupOnStart) {
            cleanupExpiredFlowData();
        }
    }

    @Scheduled(cron = "0 35 3 * * ?")
    public void cleanupExpiredFlowData() {
        cleanupLedger();
        cleanupSettlement();
    }

    private void cleanupLedger() {
        if (ledgerRetentionDays < 0) {
            return;
        }
        long cutoff = System.currentTimeMillis() - ledgerRetentionDays * 24L * 60 * 60 * 1000;
        boolean removed = flowLedgerService.remove(
                new LambdaQueryWrapper<FlowLedger>()
                        .lt(FlowLedger::getCreatedTime, cutoff)
        );
        log.info("流量账本清理完成，保留天数: {}, 截止时间戳: {}, 执行结果: {}", ledgerRetentionDays, cutoff, removed);
    }

    private void cleanupSettlement() {
        if (settlementRetentionDays < 0) {
            return;
        }
        long cutoff = System.currentTimeMillis() - settlementRetentionDays * 24L * 60 * 60 * 1000;
        boolean removed = flowSettlementService.remove(
                new LambdaQueryWrapper<FlowSettlement>()
                        .lt(FlowSettlement::getSettledTime, cutoff)
        );
        log.info("流量结算清理完成，保留天数: {}, 截止时间戳: {}, 执行结果: {}", settlementRetentionDays, cutoff, removed);
    }
}
