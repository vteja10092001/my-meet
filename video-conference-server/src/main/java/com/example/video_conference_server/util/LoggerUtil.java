package com.example.video_conference_server.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LoggerUtil {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private LoggerUtil() {
        // prevent instantiation
    }

    public static void log(String message) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        System.out.println("[" + timestamp + "] " + message);
    }

    public static void log(String tag, String message) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        System.out.println("[" + timestamp + "] [" + tag + "] " + message);
    }

    public static void error(String message, Throwable throwable) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        System.err.println("[" + timestamp + "] [ERROR] " + message);
        if (throwable != null) {
            throwable.printStackTrace(System.err);
        }
    }
}
