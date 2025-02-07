package com.tan.chat.repository;

import com.tan.chat.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
    boolean existsByRoomId(String roomId);
    Room findByRoomId(String roomId);
}