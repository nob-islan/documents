package com.example.kuberestapi.logic;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * SampleLogicImplのテストクラスです。
 * 
 */
@SpringBootTest
public class SampleLogicImplTest {

    @Autowired
    private SampleLogic sampleLogic;

    /**
     * getNowDateのテスト 正常系
     * 
     */
    @Test
    public void testGetNowDate_success() {

        // String result = null;

        // try {
        // result = sampleLogic.getNowDate();
        // } catch (Exception e) {
        // e.printStackTrace();
        // fail();
        // }

        // assertNotNull(result);
    }

}
