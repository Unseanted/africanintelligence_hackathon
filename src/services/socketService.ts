import { io, Socket } from "socket.io-client";
import { useTourLMS } from "@/contexts/TourLMSContext";

interface ScoreUpdate {
  userId: string;
  score: number;
  challengeId: string;
  timestamp: number;
}

interface TeamUpdate {
  teamId: string;
  members: string[];
  score: number;
  challengeId: string;
}

interface ChallengeUpdate {
  challengeId: string;
  status: "active" | "completed" | "expired";
  startTime: number;
  endTime: number;
  participants: string[];
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  initialize(token: string) {
    this.token = token;
    this.socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: { token },
        transports: ["websocket"],
      }
    );

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Challenge events
    this.socket.on("challenge:start", this.handleChallengeStart);
    this.socket.on("challenge:update", this.handleChallengeUpdate);
    this.socket.on("challenge:end", this.handleChallengeEnd);

    // Team events
    this.socket.on("team:update", this.handleTeamUpdate);
    this.socket.on("team:join", this.handleTeamJoin);
    this.socket.on("team:leave", this.handleTeamLeave);

    // Score events
    this.socket.on("score:update", this.handleScoreUpdate);
    this.socket.on("leaderboard:update", this.handleLeaderboardUpdate);

    // Collaboration events
    this.socket.on("collaboration:join", this.handleCollaborationJoin);
    this.socket.on("collaboration:leave", this.handleCollaborationLeave);
    this.socket.on("collaboration:update", this.handleCollaborationUpdate);
  }

  // Challenge methods
  startChallenge(challengeId: string, duration: number) {
    this.socket?.emit("challenge:start", { challengeId, duration });
  }

  updateChallenge(challengeId: string, data: Partial<ChallengeUpdate>) {
    this.socket?.emit("challenge:update", { challengeId, ...data });
  }

  endChallenge(challengeId: string) {
    this.socket?.emit("challenge:end", { challengeId });
  }

  // Team methods
  createTeam(name: string, members: string[]) {
    this.socket?.emit("team:create", { name, members });
  }

  joinTeam(teamId: string) {
    this.socket?.emit("team:join", { teamId });
  }

  leaveTeam(teamId: string) {
    this.socket?.emit("team:leave", { teamId });
  }

  // Score methods
  updateScore(score: number, challengeId: string) {
    this.socket?.emit("score:update", { score, challengeId });
  }

  // Collaboration methods
  joinCollaboration(roomId: string) {
    this.socket?.emit("collaboration:join", { roomId });
  }

  leaveCollaboration(roomId: string) {
    this.socket?.emit("collaboration:leave", { roomId });
  }

  sendCollaborationUpdate(roomId: string, data: any) {
    this.socket?.emit("collaboration:update", { roomId, data });
  }

  // Event handlers
  private handleChallengeStart = (data: ChallengeUpdate) => {
    // Handle challenge start
  };

  private handleChallengeUpdate = (data: ChallengeUpdate) => {
    // Handle challenge update
  };

  private handleChallengeEnd = (data: ChallengeUpdate) => {
    // Handle challenge end
  };

  private handleTeamUpdate = (data: TeamUpdate) => {
    // Handle team update
  };

  private handleTeamJoin = (data: TeamUpdate) => {
    // Handle team join
  };

  private handleTeamLeave = (data: TeamUpdate) => {
    // Handle team leave
  };

  private handleScoreUpdate = (data: ScoreUpdate) => {
    // Handle score update
  };

  private handleLeaderboardUpdate = (data: ScoreUpdate[]) => {
    // Handle leaderboard update
  };

  private handleCollaborationJoin = (data: any) => {
    // Handle collaboration join
  };

  private handleCollaborationLeave = (data: any) => {
    // Handle collaboration leave
  };

  private handleCollaborationUpdate = (data: any) => {
    // Handle collaboration update
  };

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();

export const useSocket = () => {
  const { token } = useTourLMS();

  if (!socketService.socket && token) {
    socketService.initialize(token);
  }

  return socketService.socket;
};
