import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import VideoGrid from '../components/VideoGrid';
import ChatPanel from '../components/ChatPanel';
import { FaRegCommentDots } from 'react-icons/fa';

const socket = io(process.env.REACT_APP_SERVER_URL);

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('name') || 'Guest';

  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        setParticipants([
          {
            id: socket.id,
            stream,
            username,
            isLocal: true,
          },
        ]);

        socket.emit('join-room', { roomId, username });

        socket.on('user-joined', async ({ userId, username }) => {
          const peer = createPeerConnection(userId, username);
          peersRef.current[userId] = peer;

          stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
          });
        });

        socket.on('offer', async ({ from, offer, username }) => {
          const peer = createPeerConnection(from, username);
          peersRef.current[from] = peer;

          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
          });

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('answer', { to: from, answer });
        });

        socket.on('answer', async ({ from, answer }) => {
          const peer = peersRef.current[from];
          if (peer && peer.signalingState === 'have-local-offer') {
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on('ice-candidate', ({ from, candidate }) => {
          const peer = peersRef.current[from];
          if (peer) {
            peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on('user-left', ({ userId }) => {
          const peer = peersRef.current[userId];
          if (peer) {
            peer.close();
            delete peersRef.current[userId];
          }
          setParticipants((prev) => prev.filter((p) => p.id !== userId));
        });

      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    init();

    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach((peer) => peer.close());
    };
  }, []);

  const createPeerConnection = (userId, username = '') => {
    if (peersRef.current[userId]) return peersRef.current[userId];

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants((prev) => {
        if (prev.find((p) => p.id === userId)) return prev;
        return [...prev, { id: userId, username, stream: remoteStream, isLocal: false }];
      });
    };

    peer.onnegotiationneeded = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('offer', { to: userId, offer });
      } catch (e) {
        console.error('Negotiation error:', e);
      }
    };

    return peer;
  };

  const handleSendMessage = useCallback((data) => {
    socket.emit('chat-message', { data });
  }, [])

  // const handleReceivedMessage = useCallback((data) => {
  //   setMessages(prev => (
  //     [...prev,
  //     {
  //       user: username === data?.username ? 'You' : data?.username,
  //       text: data?.data?.text,
  //       fileName: data?.data?.fileName,
  //       fileUrl: data?.data?.fileUrl
  //     }
  //     ]
  //   ))
  // }, [])

  const handleReceivedMessage = useCallback((data) => {
    let fileUrl = null;

    const msgData = data?.data

    if (msgData?.fileData && msgData?.fileType) {
      const blob = new Blob([msgData.fileData], { type: msgData.fileType });
      fileUrl = URL.createObjectURL(blob);
    }

    setMessages(prev => ([
      ...prev,
      {
        user: username === data?.username ? 'You' : data?.username,
        text: msgData?.text,
        fileName: msgData?.fileName,
        fileUrl: fileUrl
      }
    ]));
  }, []);


  useEffect(() => {
    socket.on('chat-message', handleReceivedMessage)
    return () => {
      socket.off('chat-message', handleReceivedMessage)
    }
  }, [])

  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <div className="h-screen w-full flex justify-center items-center pk-class">
        <div className="w-full max-h-screen overflow-y-auto ">
          <div className="w-full h-auto ">
            <VideoGrid participants={participants} />
          </div>
        </div>
      </div>

      {showSidePanel && (
        <div className="absolute top-0 right-0 w-[90%] md:w-96 h-full bg-white text-black shadow-lg z-20">
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} username={username} />
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