package com.example.video_conference_server.model;


public class ChatMessage {
    private String roomId;
    private String text;
    private String fileName;
    private byte[] fileData;
    private String fileType;


    // Enriched by server
    private String senderId;
    private String username;


    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }


    public String getText() { return text; }
    public void setText(String text) { this.text = text; }


    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }


    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }


    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }


    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }


    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}