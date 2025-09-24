package com.example.video_conference_server.model;

public class UserEvent {
    public enum Type { JOINED, LEFT }


    private String roomId;
    private String userId; // session id
    private String username;
    private Type type;


    public UserEvent() {}


    public UserEvent(String roomId, String userId, String username, Type type) {
        this.roomId = roomId;
        this.userId = userId;
        this.username = username;
        this.type = type;
    }


    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }


    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }


    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }


    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
}