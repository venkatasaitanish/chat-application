package com.tan.chat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rooms")
@Data
public class Room {
    @Id
    String roomId;
    String roomName;
}
