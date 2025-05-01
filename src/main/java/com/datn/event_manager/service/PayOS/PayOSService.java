package com.datn.event_manager.service.PayOS;


import org.springframework.stereotype.Service;

import com.datn.event_manager.configuration.PayOSConfig;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.payos.PayOS;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PayOSService {
    PayOSConfig payOSConfig;

    public PayOS getPayOSClient() {
        return new PayOS(payOSConfig.getClientId(), payOSConfig.getApiKey(), payOSConfig.getChecksumKey());
    }

}
