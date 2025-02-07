package com.tan.chat.controller;

import com.tan.chat.model.Room;
import com.tan.chat.repository.RoomRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class RoomController {

    private RoomRepository roomRepository;

    @PostMapping("/api/room/create")
    public ResponseEntity<?> createRoom(@RequestBody Room room){
        try {
            if (roomRepository.findByRoomId(room.getRoomId()) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room already exists!");
            }
            Room savedRoom = roomRepository.save(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @GetMapping("/api/room/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        try {
            Room room = roomRepository.findByRoomId(roomId);
            if (room == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room not found!");
            }
            return ResponseEntity.status(HttpStatus.OK).body(room);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
