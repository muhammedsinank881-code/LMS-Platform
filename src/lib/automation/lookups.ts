/** Resolves ids to display names for summaries and traces. Falls back to the id itself. */
export interface Lookups {
  source(id: string): string
  status(id: string): string
  user(id: string): string
  team(id: string): string
  template(id: string): string
  campaign(id: string): string
  pipeline(id: string): string
  stage(id: string): string
}

const identity = (id: string) => id

export const idLookups: Lookups = {
  source: identity,
  status: identity,
  user: identity,
  team: identity,
  template: identity,
  campaign: identity,
  pipeline: identity,
  stage: identity,
}

/** Builds a `Lookups` from id-to-name maps. */
export function lookupsFromMaps(maps: Partial<Record<keyof Lookups, ReadonlyMap<string, string>>>): Lookups {
  const pick = (key: keyof Lookups) => (id: string) => maps[key]?.get(id) ?? id
  return {
    source: pick('source'),
    status: pick('status'),
    user: pick('user'),
    team: pick('team'),
    template: pick('template'),
    campaign: pick('campaign'),
    pipeline: pick('pipeline'),
    stage: pick('stage'),
  }
}
