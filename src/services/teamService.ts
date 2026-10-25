import { TeamMember } from '../types';
import { mockTeams } from '../data/mockTeams';

class TeamService {
  private teams: TeamMember[] = [...mockTeams];

  async getTeamMembers(): Promise<TeamMember[]> {
    return Promise.resolve([...this.teams]);
  }

  async getTeamMembersByEvent(eventId: string): Promise<TeamMember[]> {
    return Promise.resolve(this.teams.filter((t) => t.assignedEventId === eventId));
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const newMember: TeamMember = {
      ...member,
      id: `team-${Date.now()}`,
    };
    this.teams.unshift(newMember);
    return Promise.resolve(newMember);
  }

  async removeTeamMember(id: string): Promise<boolean> {
    this.teams = this.teams.filter((t) => t.id !== id);
    return Promise.resolve(true);
  }
}

export const teamService = new TeamService();
