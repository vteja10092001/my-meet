package com.example.video_conference_server.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {

    // roomId -> set of usernames
    private final Map<String, Set<String>> rooms = new ConcurrentHashMap<>();

    public void addUser(String roomId, String username) {
        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(username);
    }

    public void removeUser(String roomId, String username) {
        Set<String> users = rooms.get(roomId);
        if (users != null) {
            users.remove(username);
            if (users.isEmpty()) {
                rooms.remove(roomId);
            }
        }
    }

    public Set<String> getUsers(String roomId) {
        return rooms.getOrDefault(roomId, Collections.emptySet());
    }

    public Map<String, Set<String>> getAllRooms() {
        return Collections.unmodifiableMap(rooms);
    }
}
