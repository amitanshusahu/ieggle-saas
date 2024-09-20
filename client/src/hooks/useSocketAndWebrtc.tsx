import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useMessageStore, useSettingStore, useSocketStore, useUserStore } from "../store/useStore";

export default function useSocketAndWebRTC() {
  const { type, setType, remoteSocket, setRemoteSocket, setSocketFromStore, setRoomId } = useSocketStore();
  const { im, lookingFor, roomType, setIsConnectionStarted, setIsConnectedWithOtherUser } = useUserStore();
  const { isVideo, isAudio } = useSettingStore();
  const { setStrangerMsg } = useMessageStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const strangerVideoRef = useRef<HTMLVideoElement>(null);

  // Capture media whenever isAudio or isVideo changes
  useEffect(() => {
    startMediaCapture();
  }, [isAudio, isVideo]);

  // Cleanup media tracks on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Clean up socket and peer on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        setSocketFromStore(null);
        setIsConnectionStarted(false);
        setIsConnectedWithOtherUser(false);
      }
    };
  }, [socket]);

  // Peer cleanup effect
  useEffect(() => {
    return () => {
      if (peer) {
        peer.close();
        setPeer(null);
      }
    };
  }, [peer]);

  // Socket event listeners and cleanup
  useEffect(() => {
    if (!socket) return;

    socket.on("disconnected", handleDisconnect);
    socket.on("remote-socket", handleRemoteSocket);
    socket.on("sdp:reply", handleSdpReply);
    socket.on("ice:reply", handleIceReply);
    socket.on('get-message', handleGetMessage);
    socket.on('get-type', (type) => setType(type));
    socket.on('roomid', (roomid) => setRoomId(roomid));

    return () => {
      socket.off("disconnected");
      socket.off("remote-socket");
      socket.off("sdp:reply");
      socket.off("ice:reply");
      socket.off("get-message");
      socket.off("get-type");
      socket.off("roomid");
    };
  }, [socket, type, peer]);

  const connectSocket = () => {
    if (!socket) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL, {
        reconnection: false,
      });
      newSocket.on("connect", () => {
        setSocket(newSocket);
        setSocketFromStore(newSocket);
        setIsConnectionStarted(true);
        emmitStart(newSocket);
      });
    }
  };

  const disconnectSocket = async () => {
    if (myVideoRef.current) {
      const stream = myVideoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      myVideoRef.current.srcObject = null;
    }

    if (strangerVideoRef.current) {
      const stream = strangerVideoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      strangerVideoRef.current.srcObject = null;
    }
    setSocket((currentSocket) => {
      if (currentSocket) {
        currentSocket.disconnect();
        setSocketFromStore(null);
        setIsConnectionStarted(false);
        setIsConnectedWithOtherUser(false);
      }
      return null; // Ensures that `setSocket(null)` is called after disconnect
    });
    if (peer) {
      peer.getSenders().forEach(sender => sender.track?.stop());
      peer.close();
      setPeer(null);
    }
  };

  const handleSkipAndReconnect = async () => {
    disconnectSocket(); // Ensure old connection is fully closed
    await startMediaCapture(); // Start fresh media capture
    connectSocket(); // Establish new connection
  };

  const emmitStart = (currentSocket: Socket) => {
    currentSocket.emit("start", { im, lookingFor, roomType });
  };

  const handleRemoteSocket = async (id: string) => {
    setRemoteSocket(id);
    setIsConnectedWithOtherUser(true);

    const peerConnection = createPeerConnection();
    setPeer(peerConnection);

    const stream = mediaStream || (await startMediaCapture());
    if (stream) {
      addTracksToPeer(peerConnection, stream);
    }
  };

  const handleSdpReply = async ({ sdp }: { sdp: RTCSessionDescription }) => {
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      if (type === "p2") {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket?.emit("sdp:send", { sdp: peer.localDescription });
      }
    }
  };

  const handleIceReply = async ({ candidate }: { candidate: RTCIceCandidate }) => {
    if (peer) {
      await peer.addIceCandidate(candidate);
    }
  };

  const handleDisconnect = () => {
    // disconnectSocket();
    alert("stranger disconnected")
    // handleSkipAndReconnect()
    disconnectSocket();
    startMediaCapture();
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const peer = new RTCPeerConnection();
  
    peer.onnegotiationneeded = async () => {
      if (peer) {
        await webrtc(peer); // Trigger renegotiation
      }
    };
  
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket?.emit("ice:send", { candidate: e.candidate, to: remoteSocket });
      }
    };
  
    peer.ontrack = (e) => {
      if (strangerVideoRef.current) {
        strangerVideoRef.current.srcObject = e.streams[0];
        strangerVideoRef.current.play();
      }
    };
  
    return peer;
  };

  const webrtc = async (peer: RTCPeerConnection) => {
    if (type === "p1") {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket?.emit("sdp:send", { sdp: peer.localDescription });
    }
  };

  const startMediaCapture = async () => {
    try {
      // Stop existing tracks before re-capturing media
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        audio: isAudio,
        video: isVideo || {
          width: { ideal: 640 }, // 360p width
          height: { ideal: 360 }, // 360p height
        },
      };

      // Capture media based on current video/audio settings
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      // Set local video stream
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.play();
        myVideoRef.current.muted = true;
      }

      // Update peer connection with the new tracks
      if (peer) {
        peer.getSenders().forEach(sender => {
          if (sender.track?.kind === 'video' && !isVideo) {
            sender.track.stop(); // Stop sending video
            peer.removeTrack(sender); // Remove track from peer connection
          } else if (sender.track?.kind === 'audio' && !isAudio) {
            sender.track.stop(); // Stop sending audio
            peer.removeTrack(sender); // Remove track from peer connection
          }
        });

        // Add new tracks for video/audio based on settings
        if (isVideo) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) peer.addTrack(videoTrack, stream);
        }

        if (isAudio) {
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) peer.addTrack(audioTrack, stream);
        }
      }

      return stream;
    } catch (ex) {
      console.error("Media capture error:", ex);
    }
  };


  const addTracksToPeer = (peer: RTCPeerConnection, stream: MediaStream) => {
    if (isVideo) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const sender = peer.addTrack(videoTrack, stream);

        // Set preferred video quality
        const parameters = sender.getParameters();
        if (!parameters.encodings) {
          parameters.encodings = [{}];
        }
        parameters.encodings[0] = {
          ...parameters.encodings[0],
          maxBitrate: 100000, // Maximum bitrate (e.g., 500kbps)
          maxFramerate: 15, // Maximum frame rate
        };

        sender.setParameters(parameters);
      }
    }

    if (isAudio) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) peer.addTrack(audioTrack, stream);
    }
  };

  const handleGetMessage = (input: string) => {
    setStrangerMsg(input);
  };

  return {
    myVideoRef,
    strangerVideoRef,
    connectSocket,
    disconnectSocket,
    handleSkipAndReconnect,
  };
}
