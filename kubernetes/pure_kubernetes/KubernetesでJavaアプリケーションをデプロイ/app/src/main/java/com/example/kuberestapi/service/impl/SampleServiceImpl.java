package com.example.kuberestapi.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.kuberestapi.logic.SampleLogic;
import com.example.kuberestapi.service.SampleService;

/**
 * k8sデプロイテスト用のサービス実装クラスです。
 * 
 */
@Service
public class SampleServiceImpl implements SampleService {

    @Autowired
    private SampleLogic sampleLogic;

    @Override
    public String getNowDate() {

        String nowDateMessage = sampleLogic.getNowDate();

        return nowDateMessage;
    }

}
