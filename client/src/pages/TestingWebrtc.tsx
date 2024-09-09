import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useSocketStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const { type, setType, remoteSocket, setRemoteSocket } = useSocketStore();
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);
  const strangerVideo = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState("no one connected");

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const connectSocket = (): void => {
    if (!socket) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL);
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setSocket(newSocket);
        emmitStart(newSocket);
      });
    } else {
      console.log("Socket is already connected!!");
    }
  };

  const disconnectSocket = (): void => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      if (peer) {
        peer.close();
        setPeer(null);
      }
      setStatus("no one connected");
    }
  };

  const emmitStart = (currentSocket: Socket) => {
    currentSocket.emit("start", (person: string) => {
      setType(person);
      console.log("type", person);
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("disconnected", () => {
      alert("disconnected");
      disconnectSocket();
    });

    socket.on("remote-socket", (id) => {
      console.log("Received remote-socket event with id:", id);
      setRemoteSocket(id);
      setStatus("remote socket connected, someone connected");

      // Create peer connection when remote socket is received
      const peerConnection = createPeerConnection();
      setPeer(peerConnection);
      startMediaCapture(peerConnection);
    });

    socket.on("sdp:reply", async ({ sdp }) => {
      console.log("received sdp:reply");
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("Peer remote description set");
        if (type === "p2") {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("sdp:send", { sdp: peer.localDescription });
        }
      }
    });

    socket.on("ice:reply", async ({ candidate }) => {
      console.log("received ice:reply");
      if (peer) {
        await peer.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("remote-socket");
      socket.off("sdp:reply");
      socket.off("ice:reply");
    };
  }, [socket, type, navigate, peer]);

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
      if (strangerVideo.current) {
        strangerVideo.current.srcObject = e.streams[0];
        strangerVideo.current.play();
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
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
          myVideo.current.play();
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

  return (
    <div>
      <video className="bg-black" autoPlay id="my-video" ref={myVideo}></video>
      <video className="bg-black" autoPlay id="video" ref={strangerVideo}></video>
      <button onClick={connectSocket}>Connect</button>
      <button onClick={disconnectSocket}>Disconnect</button>
      <div>{status}</div>
    </div>
  );
}
