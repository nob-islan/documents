package com.example.kuberestapi.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * k8sデプロイテスト用のサービスインターフェースです。
 * 
 */
@Service
@RestController
@RequestMapping("/k8s")
public interface SampleService {

    /**
     * 現在日時を返すメソッドです。
     * 
     * @return
     */
    @RequestMapping(value = "/date", method = RequestMethod.GET)
    String getNowDate();
}
