import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import ChatPanel from '../components/ChatPanel';
import { FaRegCommentDots } from 'react-icons/fa';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('name') || 'Guest';

  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const stompClientRef = useRef(null);

  // ✅ Setup WebSocket Connection
  useEffect(() => {
    const connect = async () => {
      const client = new Client({
        webSocketFactory: () =>
            new SockJS(process.env.REACT_APP_SERVER_URL + '/ws'),
        reconnectDelay: 5000,
        onConnect: async () => {
          console.log('Connected to WebSocket');

          // Subscribe to room events
          client.subscribe(`/topic/rooms/${roomId}/events`, (msg) => {
            const evt = JSON.parse(msg.body);
            if (evt.type === 'JOINED') {
              console.log(`${evt.username} joined`);
            } else if (evt.type === 'LEFT') {
              setParticipants((prev) =>
                  prev.filter((p) => p.id !== evt.userId)
              );
            }
          });

          // Subscribe to chat messages
          client.subscribe(`/topic/rooms/${roomId}/chat`, (msg) => {
            const data = JSON.parse(msg.body);
            handleReceivedMessage(data);
          });

          // Subscribe to signaling (offer/answer/candidates)
          client.subscribe(`/topic/rooms/${roomId}/signal`, async (msg) => {
            const signal = JSON.parse(msg.body);
            handleSignal(signal);
          });

          // Join the room
          client.publish({
            destination: '/app/join-room',
            body: JSON.stringify({ roomId, username }),
          });

          // Start local media
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;

          setParticipants([
            { id: 'local', stream, username, isLocal: true },
          ]);
        },
      });

      client.activate();
      stompClientRef.current = client;
    };

    connect();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      Object.values(peersRef.current).forEach((peer) => peer.close());
    };
  }, [roomId, username]);

  // ✅ Handle signaling from backend
  const handleSignal = async (signal) => {
    const { type, from, offer, answer, candidate, username: remoteName } =
        signal;

    if (type === 'offer') {
      const peer = createPeerConnection(from, remoteName);
      peersRef.current[from] = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      const ans = await peer.createAnswer();
      await peer.setLocalDescription(ans);
      sendSignal({ to: from, type: 'answer', answer: ans });
    } else if (type === 'answer') {
      const peer = peersRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } else if (type === 'ice-candidate') {
      const peer = peersRef.current[from];
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  };

  // ✅ Send signaling message
  const sendSignal = (payload) => {
    stompClientRef.current.publish({
      destination: '/app/signal',
      body: JSON.stringify({ roomId, ...payload }),
    });
  };

  // ✅ Create Peer Connection
  const createPeerConnection = (userId, remoteName = '') => {
    if (peersRef.current[userId]) return peersRef.current[userId];

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          to: userId,
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants((prev) => {
        if (prev.find((p) => p.id === userId)) return prev;
        return [
          ...prev,
          { id: userId, username: remoteName, stream: remoteStream, isLocal: false },
        ];
      });
    };

    peer.onnegotiationneeded = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        sendSignal({ to: userId, type: 'offer', offer });
      } catch (e) {
        console.error('Negotiation error:', e);
      }
    };

    return peer;
  };

  // ✅ Chat Messaging
  const handleSendMessage = useCallback((data) => {
    stompClientRef.current.publish({
      destination: '/app/chat',
      body: JSON.stringify({ roomId, data, username }),
    });
  }, [roomId, username]);

  const handleReceivedMessage = useCallback((data) => {
    let fileUrl = null;
    const msgData = data?.data;

    if (msgData?.fileData && msgData?.fileType) {
      const blob = new Blob([msgData.fileData], { type: msgData.fileType });
      fileUrl = URL.createObjectURL(blob);
    }

    setMessages((prev) => [
      ...prev,
      {
        user: username === data?.username ? 'You' : data?.username,
        text: msgData?.text,
        fileName: msgData?.fileName,
        fileUrl: fileUrl,
      },
    ]);
  }, [username]);

  return (
      <div className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden">
        <div className="h-screen w-full flex justify-center items-center">
          <div className="w-full max-h-screen overflow-y-auto ">
            <div className="w-full h-auto ">
              <VideoGrid participants={participants} />
            </div>
          </div>
        </div>

        {showSidePanel && (
            <div className="absolute top-0 right-0 w-[90%] md:w-96 h-full bg-white text-black shadow-lg z-20">
              <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  username={username}
              />
            </div>
        )}

        <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="absolute top-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
            title="Chat Box"
        >
          <FaRegCommentDots className="w-3 h-3" />
        </button>
      </div>
  );
};

export default Room;
