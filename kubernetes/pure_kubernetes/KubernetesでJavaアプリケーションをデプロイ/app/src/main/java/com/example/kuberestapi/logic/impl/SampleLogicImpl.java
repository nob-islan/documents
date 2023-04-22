package com.example.kuberestapi.logic.impl;

import java.io.File;
import java.io.FileWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;

import com.example.kuberestapi.logic.SampleLogic;
import com.example.kuberestapi.util.Constants;

/**
 * k8sデプロイテスト用のロジック実装クラスです。
 * 
 */
@Component
public class SampleLogicImpl implements SampleLogic {

    /**
     * {@inheritDoc}
     * 
     */
    @Override
    public String getNowDate() {

        // 現在日時の取得および返却用メッセージの作成
        LocalDateTime nowDateTime = LocalDateTime.now();
        String retMessage = "現在の日時は" + nowDateTime.toString() + "です。";

        // ログの作成、格納
        makeLog(retMessage, nowDateTime);

        return retMessage;
    }

    /**
     * ログを作成するメソッドです。
     * 
     */
    private void makeLog(String message, LocalDateTime dateTime) {

        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String dateString = dateTime.format(dateTimeFormatter);

        try {
            File file = new File(Constants.FILE_PATH + dateString);
            FileWriter fileWriter = new FileWriter(file);

            fileWriter.write(message);

            fileWriter.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
