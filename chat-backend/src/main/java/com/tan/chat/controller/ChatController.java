package com.tan.chat.controller;

import com.tan.chat.model.ChatMessage;
import com.tan.chat.repository.ChatMessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


import java.time.LocalDateTime;
import java.util.List;

@RestController
@AllArgsConstructor
public class ChatController {


    private final SimpMessagingTemplate messagingTemplate;
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/public")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat/{roomId}")
    public void sendMessageToRoom(@Payload ChatMessage message, @DestinationVariable String roomId) {
        message.setRoomId(roomId);
        message.setTimeStamp(LocalDateTime.now());
        System.out.println(message);
        chatMessageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/" + roomId, message);
    }


    @GetMapping("/api/getChatHistory/public")
    public List<ChatMessage> getPublicChatHistory() {
        return chatMessageRepository.findAll();
    }

    @GetMapping("/api/getChatHistory/{roomId}")
    public List<ChatMessage> getRoomChatHistory(@PathVariable String roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }

}
