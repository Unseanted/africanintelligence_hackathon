import { io, Socket } from "socket.io-client";
import { useTourLMS } from "@/contexts/TourLMSContext";

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  initialize(token: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.socket = io(process.env.REACT_APP_WS_URL || "ws://localhost:8082", {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  // Team Management
  joinTeam(teamId: string) {
    this.socket?.emit("team:join", { teamId });
  }

  leaveTeam(teamId: string) {
    this.socket?.emit("team:leave", { teamId });
  }

  // Challenge Management
  startChallenge(challengeId: string) {
    this.socket?.emit("challenge:start", { challengeId });
  }

  submitSolution(challengeId: string, solution: any) {
    this.socket?.emit("challenge:submit", { challengeId, solution });
  }

  // Real-time Updates
  onTeamUpdate(callback: (data: any) => void) {
    this.socket?.on("team:update", callback);
  }

  onChallengeUpdate(callback: (data: any) => void) {
    this.socket?.on("challenge:update", callback);
  }

  onLeaderboardUpdate(callback: (data: any) => void) {
    this.socket?.on("leaderboard:update", callback);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default WebSocketService;
