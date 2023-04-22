package com.example.kuberestapi.logic;

import org.springframework.stereotype.Component;

/**
 * k8sデプロイテスト用のロジックインターフェースです。
 * 
 */
@Component
public interface SampleLogic {

    /**
     * 現在日時を返すメソッドです。
     * 
     * @return
     */
    String getNowDate();
}
