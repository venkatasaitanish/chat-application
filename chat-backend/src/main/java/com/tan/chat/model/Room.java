package com.tan.chat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "rooms")
@Data
public class Room {
    @Id
    private String roomId;
    private String roomCode;
    private String roomName;
    private String createdBy;
    private LocalDateTime createdTimeStamp;
}
