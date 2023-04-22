package com.example.kuberestapi.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * SampleServiceImplのテストクラスです。
 * 
 */
@SpringBootTest
public class SampleServiceImplTest {

    @Autowired
    private SampleService sampleService;

    /**
     * getNowDateのテスト 正常系
     * 
     */
    @Test
    public void testGetNowDate_success() {

        // String result = null;

        // try {
        // result = sampleService.getNowDate();
        // } catch (Exception e) {
        // e.printStackTrace();
        // fail();
        // }

        // assertNotNull(result);

    }

}
