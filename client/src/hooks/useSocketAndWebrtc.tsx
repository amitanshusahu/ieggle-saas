import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useMessageStore, useSocketStore, useUserStore } from "../store/useStore";

export default function useSocketAndWebRTC() {
  const { type, setType, remoteSocket, setRemoteSocket, setSocketFromStore, setRoomId } = useSocketStore();
  const {im, lookingFor, roomType, setStart} = useUserStore();
  const {setStrangerMsg} = useMessageStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("no one connected");

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const strangerVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("disconnected", handleDisconnect);
    socket.on("remote-socket", handleRemoteSocket);
    socket.on("sdp:reply", handleSdpReply);
    socket.on("ice:reply", handleIceReply);
    socket.on('get-message', handleGetMessage);
    socket.on('get-type', (type) => {
      setType(type);
      console.log("type: ", type)
    });
    socket.on('roomid', (roomid) => {
      console.log('got room id')
      setRoomId(roomid);
      console.log("roomid", roomid);
    });

    return () => {
      socket.off("disconnected")
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
      const newSocket = io(import.meta.env.VITE_SERVER_URL);
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setSocket(newSocket);
        setSocketFromStore(newSocket);
        emmitStart(newSocket);
      });
    } else {
      console.log("Socket is already connected!!");
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setSocketFromStore(null);
      setStart(false)
    }
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setStatus("no one connected");
  };

  const emmitStart = (currentSocket: Socket) => {
    currentSocket.emit("start", {im, lookingFor, roomType}, () => {
      console.log("emitted start");
    });
  };

  // video chart realated
  const handleRemoteSocket = (id: string) => {
    console.log("remote socket id ", id);
    setRemoteSocket(id);
    setStatus("remote socket connected, someone connected");

    // Create peer connection when remote socket is received
    const peerConnection = createPeerConnection();
    setPeer(peerConnection);
    startMediaCapture(peerConnection);
  };

  const handleSdpReply = async ({ sdp }: { sdp: RTCSessionDescription }) => {
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("Peer remote description set");
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
    alert("disconnected");
    disconnectSocket();
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const peer = new RTCPeerConnection();

    peer.onnegotiationneeded = async () => {
      if (peer) await webrtc(peer);
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket?.emit("ice:send", { candidate: e.candidate, to: remoteSocket });
        console.log("sent:ice");
      }
    };

    peer.ontrack = (e) => {
      console.log("Received remote track:", e);
      if (strangerVideoRef.current) {
        strangerVideoRef.current.srcObject = e.streams[0];
        strangerVideoRef.current.play();
      }
    };

    console.log("Created new peer connection");
    return peer;
  };

  const webrtc = async (peer: RTCPeerConnection) => {
    if (type === "p1") {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket?.emit("sdp:send", { sdp: peer.localDescription });
      console.log("sent:sdp");
    }
  };

  const startMediaCapture = (peer: RTCPeerConnection) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
          myVideoRef.current.play();
          console.log("my video working");
        }

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        console.log("tracks added to peer connection");
      })
      .catch((ex) => {
        console.error("Media capture error:", ex);
      });
  };

  // text chat related
  const handleGetMessage = (input: string, type: string) => {
    addMessageToMessageBox(input, type);
  }

  const addMessageToMessageBox = (msg: string, from: string) => {
    setStrangerMsg(msg)
  }

  return {
    myVideoRef,
    strangerVideoRef,
    connectSocket,
    disconnectSocket,
    status,
  };
}
