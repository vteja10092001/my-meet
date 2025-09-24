import React, { useEffect, useRef, useState } from 'react';
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from 'react-icons/fa';

/**
 * Grid of participant video cards
 */
const VideoGrid = React.memo(({ participants, onLocalTrack }) => {
  // reverse so newest participants appear first
  const reversedParticipants = [...participants].reverse();

  return (
      <div className="w-full h-full overflow-y-auto p-4 flex justify-center">
        <div className="flex flex-wrap justify-center gap-5 w-full">
          {reversedParticipants.map((participant) => (
              <div
                  key={participant.id}
                  className="
              bg-gray-800 rounded-lg overflow-hidden shadow-md 
              flex flex-col items-center justify-center 
              w-full sm:w-1/2 md:w-1/3 lg:w-1/4
            "
              >
                <VideoPlayer
                    stream={participant.stream}
                    isLocal={participant.isLocal}
                    username={participant.username}
                    onLocalTrack={onLocalTrack}
                />
                <div className="text-center font-bold text-sm p-2 text-white">
                  {participant.isLocal ? 'You' : participant.username}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
});

/**
 * Single participant video player
 */
const VideoPlayer = ({ stream, isLocal, username, onLocalTrack }) => {
  const videoRef = useRef();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleTrack = async (kind) => {
    const mediaStream = videoRef.current?.srcObject;
    if (!mediaStream) return;

    // AUDIO toggle: enable/disable
    if (kind === 'audio') {
      const audioTracks = mediaStream.getAudioTracks();
      if (!audioTracks.length) return;
      const newState = !audioTracks[0].enabled;
      audioTracks.forEach((t) => (t.enabled = newState));
      setIsAudioOn(newState);
      return;
    }

    // VIDEO toggle: stop/reacquire
    if (kind === 'video') {
      const videoTracks = mediaStream.getVideoTracks();

      if (isVideoOn && videoTracks.length > 0) {
        // Turn OFF → stop & remove tracks
        videoTracks.forEach((track) => {
          try {
            track.stop(); // release hardware
            mediaStream.removeTrack(track);
          } catch (e) {
            console.warn('Error stopping video track', e);
          }
        });
        videoRef.current.srcObject = mediaStream;
        setIsVideoOn(false);
        return;
      }

      // Turn ON → request camera again
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = newStream.getVideoTracks()[0];
        if (!newTrack) throw new Error('No video track returned');

        // Try to attach to the existing stream
        try {
          mediaStream.addTrack(newTrack);
          videoRef.current.srcObject = mediaStream;
        } catch (e) {
          // fallback: replace stream entirely
          console.warn('Replacing srcObject with new stream', e);
          videoRef.current.srcObject = newStream;
        }

        setIsVideoOn(true);

        // Notify parent so it can attach track to all peer connections
        if (typeof onLocalTrack === 'function') {
          onLocalTrack(newTrack);
        }
      } catch (err) {
        console.error('Error re-enabling video (getUserMedia):', err);
      }
    }
  };

  return (
      <div className="relative w-full">
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // local video must be muted
            className="w-full h-full max-h-[60vh] object-contain rounded-t-lg scale-x-[-1]"
        />

        {isLocal && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 z-10">
              <button
                  onClick={() => toggleTrack('video')}
                  className="bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-700"
              >
                {isVideoOn ? <FaVideo size={14} /> : <FaVideoSlash size={14} />}
              </button>
              <button
                  onClick={() => toggleTrack('audio')}
                  className="bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-700"
              >
                {isAudioOn ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} />}
              </button>
            </div>
        )}
      </div>
  );
};

export default VideoGrid;
