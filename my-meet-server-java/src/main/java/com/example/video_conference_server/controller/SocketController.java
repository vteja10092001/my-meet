package com.example.video_conference_server.controller;

import com.example.video_conference_server.model.ChatMessage;
import com.example.video_conference_server.model.JoinRoomMessage;
import com.example.video_conference_server.model.SignalMessage;
import com.example.video_conference_server.model.UserEvent;
import com.example.video_conference_server.service.RoomService;
import com.example.video_conference_server.util.LoggerUtil;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;

    public SocketController(SimpMessagingTemplate messagingTemplate, RoomService roomService) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
    }

    @MessageMapping("/join-room")
    public void handleJoinRoom(@Payload JoinRoomMessage joinMsg) {
        String roomId = joinMsg.getRoomId();
        String username = joinMsg.getUsername();
        String userId = UUID.randomUUID().toString(); // generate unique userId if not provided

        roomService.addUser(roomId, username);

        LoggerUtil.log(username + " joined room " + roomId);

        // Broadcast JOINED event
        UserEvent evt = new UserEvent(
                roomId,
                userId,
                username,
                UserEvent.Type.JOINED
        );

        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/events", evt);
    }

    @MessageMapping("/offer")
    public void handleOffer(@Payload SignalMessage offerMsg) {
        offerMsg.setType("offer");
        messagingTemplate.convertAndSend("/topic/rooms/" + offerMsg.getRoomId() + "/signals", offerMsg);
    }

    @MessageMapping("/answer")
    public void handleAnswer(@Payload SignalMessage answerMsg) {
        answerMsg.setType("answer");
        messagingTemplate.convertAndSend("/topic/rooms/" + answerMsg.getRoomId() + "/signals", answerMsg);
    }

    @MessageMapping("/ice-candidate")
    public void handleIce(@Payload SignalMessage iceMsg) {
        iceMsg.setType("ice-candidate");
        messagingTemplate.convertAndSend("/topic/rooms/" + iceMsg.getRoomId() + "/signals", iceMsg);
    }

    @MessageMapping("/chat-message")
    public void handleChat(@Payload ChatMessage chatMsg) {
        LoggerUtil.log("Chat in room " + chatMsg.getRoomId() + " from " + chatMsg.getUsername());

        messagingTemplate.convertAndSend("/topic/rooms/" + chatMsg.getRoomId() + "/chat", chatMsg);
    }
}
