package com.example.video_conference_server.model;


/**
 * Generic signal message for offer/answer/ice-candidate
 * Room-based broadcasting with client-side filtering by `to`.
 */
public class SignalMessage {
    private String roomId; // destination room
    private String to; // target client id (front-end decides)
    private String from; // sender client id (filled by server)
    private String username; // sender username (filled by server)


    private Object offer; // SDP offer
    private Object answer; // SDP answer
    private Object candidate;// ICE candidate
    private String type; // "offer" | "answer" | "ice-candidate"


    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }


    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }


    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }


    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }


    public Object getOffer() { return offer; }
    public void setOffer(Object offer) { this.offer = offer; }


    public Object getAnswer() { return answer; }
    public void setAnswer(Object answer) { this.answer = answer; }


    public Object getCandidate() { return candidate; }
    public void setCandidate(Object candidate) { this.candidate = candidate; }


    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}