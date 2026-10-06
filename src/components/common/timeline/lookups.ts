export interface TimelineStatus {
  name: string
  color: string
}

/** Names the timeline needs from the workspace. Missing ids fall back to the raw id. */
export interface TimelineLookups {
  status: (id: string) => TimelineStatus | undefined
  stage?: (id: string) => TimelineStatus | undefined
  userName: (id: string | null) => string
  sourceName: (id: string) => string
}
