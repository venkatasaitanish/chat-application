package com.tan.chat.controller;

import com.tan.chat.model.ChatMessage;
import com.tan.chat.model.Room;
import com.tan.chat.repository.ChatMessageRepository;
import com.tan.chat.repository.RoomRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final SimpMessagingTemplate messagingTemplate;
    private ChatMessageRepository chatMessageRepository;
    private RoomRepository roomRepository;

    @MessageMapping("/chat/public")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat/{roomId}")
    public void sendMessageToRoom(@Payload ChatMessage chatMessage, @DestinationVariable String roomId) {
        try {
            if (roomId == null || roomId.trim().isEmpty()) {
                log.error("Invalid roomId received");
                throw new IllegalArgumentException("Room ID cannot be empty");
            }
            if (chatMessage == null || chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                log.error("Invalid message received");
                throw new IllegalArgumentException("Message content cannot be empty");
            }
            chatMessage.setRoomId(roomId);
            chatMessage.setTimeStamp(LocalDateTime.now());

            chatMessageRepository.save(chatMessage);
            messagingTemplate.convertAndSend("/topic/" + roomId, chatMessage);
            log.info("Message sent to room {}: {}", roomId, chatMessage);

        } catch (IllegalArgumentException e) {
            log.error("Validation error", e);
        } catch (Exception e) {
            log.error("Unexpected error while sending message", e);
        }
    }


    @GetMapping("/api/getChatHistory/public")
    public List<ChatMessage> getPublicChatHistory() {
        return chatMessageRepository.findAll();
    }

    @GetMapping("/api/getChatHistory/{roomId}")
    public ResponseEntity<?> getRoomChatHistory(@PathVariable String roomId) {
        try {
            if (roomId == null || roomId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Room ID cannot be empty");
            }
            Room room = roomRepository.findByRoomId(roomId);
            if (room == null) {
                return ResponseEntity.badRequest().body("Room not found!");
            }
            List<ChatMessage> chatMessages = chatMessageRepository.findByRoomId(roomId);
            return ResponseEntity.ok().body(chatMessages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while retrieving chat history");
        }
    }

}
