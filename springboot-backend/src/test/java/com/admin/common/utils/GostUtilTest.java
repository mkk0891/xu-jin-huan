package com.admin.common.utils;

import com.admin.entity.Tunnel;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GostUtilTest {

    @Test
    void buildServiceConfigsKeepsUdpSessionsAliveForHy2LikeTraffic() {
        Tunnel tunnel = new Tunnel();
        tunnel.setTcpListenAddr("[::]");
        tunnel.setUdpListenAddr("[::]");

        JSONArray services = GostUtil.buildServiceConfigs(
                "hy2-forward",
                10002,
                null,
                "example.com:443",
                1,
                tunnel,
                null,
                null
        );

        JSONObject udpService = services.getJSONObject(1);
        JSONObject metadata = udpService.getJSONObject("listener").getJSONObject("metadata");

        assertEquals("udp", udpService.getJSONObject("listener").getString("type"));
        assertEquals(true, metadata.getBoolean("keepalive"));
        assertEquals("120s", metadata.getString("ttl"));
        assertEquals(65535, metadata.getIntValue("readBufferSize"));
        assertEquals(512, metadata.getIntValue("readQueueSize"));
        assertEquals(512, metadata.getIntValue("backlog"));
    }
}
