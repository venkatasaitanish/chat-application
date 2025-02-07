package com.tan.chat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class ChatMessage {
    @Id
    private String chatId;
    private String sender;
    private String content;
    private LocalDateTime timeStamp;
    private String roomId;
}
