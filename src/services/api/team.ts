import type { ListParams, Paginated, Role, Team, User } from '@/types'

/** Member row with live workload counts. Extends the stored user. */
export interface Member extends User {
  openLeads: number
  openFollowUps: number
}

/** What any signed-in member may see about a colleague, for assignee pickers and avatars. */
export type DirectoryUser = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'teamId' | 'avatarUrl' | 'status' | 'language' | 'location'
>

export type MemberFilterField = 'name' | 'role' | 'teamId' | 'status'

export interface InviteMemberInput {
  emails: string[]
  role: Role
  teamId?: string | null
}

export interface Invitation {
  id: string
  email: string
  role: Role
  teamId: string | null
  token: string
  invitedByName: string
  userId: string
  createdAt: string
}

export interface DeactivateMemberInput {
  /** `user` moves open leads to `userId`. `rules` runs assignment rules, then the fallback. */
  mode: 'user' | 'rules'
  userId?: string | null
}

export interface UpdateMemberInput {
  role?: Role
  teamId?: string | null
  status?: User['status']
  language?: string
  location?: string
}

export type TeamInput = Pick<Team, 'name' | 'leaderId' | 'color'>

export interface TeamApiClient {
  /** Open to every role: names and teams only. */
  directory(): Promise<DirectoryUser[]>
  listMembers(params?: ListParams<MemberFilterField>): Promise<Paginated<Member>>
  getMember(id: string): Promise<Member>
  invite(input: InviteMemberInput): Promise<Invitation[]>
  listInvitations(): Promise<Invitation[]>
  resendInvitation(id: string): Promise<Invitation>
  revokeInvitation(id: string): Promise<void>
  updateMember(id: string, patch: UpdateMemberInput): Promise<User>
  deactivateMember(id: string, input: DeactivateMemberInput): Promise<User>
  listTeams(): Promise<Team[]>
  createTeam(input: TeamInput): Promise<Team>
  updateTeam(id: string, patch: Partial<TeamInput>): Promise<Team>
  deleteTeam(id: string): Promise<void>
}
