import type {
  Ad,
  AdSet,
  Campaign,
  CampaignObjective,
  CampaignPlatform,
  CampaignStatus,
  SpendEntry,
  User,
} from '@/types'
import { DAY, chance, int, pick, scaled, seedId, type SeedEnv } from './rng'

type CampaignDef = [
  name: string,
  platform: CampaignPlatform,
  objective: CampaignObjective,
  status: CampaignStatus,
  /** Spend as a percentage of budget by the end of the data. Above 100 means overspent. */
  spendPct: number,
  adSets: string[],
]

const CAMPAIGN_DEFS: CampaignDef[] = [
  ['Diwali Dhamaka: Search', 'google_ads', 'sales', 'active', 92, ['Brand', 'Generic', 'Competitors']],
  ['Lead Ads: Festive Offer', 'facebook', 'leads', 'active', 78, ['Metro 25-45', 'Lookalike 1%']],
  ['Brand Reels', 'instagram', 'awareness', 'active', 66, ['Small Business', 'Creators']],
  ['Decision Makers Outreach', 'linkedin', 'leads', 'active', 108, ['Founders', 'CXOs']],
  ['Re-engage Old Leads', 'whatsapp', 'retention', 'paused', 55, ['Cold 90d', 'Quoted not closed']],
  ['Q4 Email Nurture', 'email', 'engagement', 'active', 71, ['Newsletter', 'Trial users']],
  ['Mumbai Business Expo', 'offline', 'leads', 'completed', 97, ['Stall visitors', 'Workshop']],
  ['Retargeting: Website Visitors', 'facebook', 'sales', 'active', 124, ['Visitors 30d', 'Cart abandoners']],
  ['Local Services Display', 'google_ads', 'awareness', 'paused', 83, ['Tier-2 Cities', 'Remarketing']],
  ['Growth Webinar', 'linkedin', 'leads', 'completed', 89, ['Marketing Heads', 'Agency Owners']],
  ['Partner Referral Push', 'other', 'sales', 'active', 48, ['Channel partners', 'Existing customers']],
  ['Spring Launch Teaser', 'instagram', 'awareness', 'draft', 0, ['Stories', 'Reels']],
]

const AD_NAMES = ['Carousel A', 'Video 15s', 'Static Offer', 'Testimonial', 'Lead Form']

export interface CampaignSeed {
  campaigns: Campaign[]
  adSets: AdSet[]
  ads: Ad[]
  spendEntries: SpendEntry[]
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10)

/** Campaigns, their ad sets and ads, and a daily spend entry for every running ad. */
export function buildCampaigns(env: SeedEnv, users: User[]): CampaignSeed {
  const owners = users.filter((u) => u.role !== 'salesperson')
  const defs = CAMPAIGN_DEFS.slice(0, scaled(env, CAMPAIGN_DEFS.length, 3))
  const seed: CampaignSeed = { campaigns: [], adSets: [], ads: [], spendEntries: [] }

  defs.forEach(([name, platform, objective, status, spendPct, adSetNames], index) => {
    const id = seedId(env, 'campaign', index + 1)
    const budget = int(env, 4, 25) * 25_000
    const draft = status === 'draft'
    const daysAgo = draft ? 3 : int(env, 100, 140)
    const start = new Date(env.now.getTime() - daysAgo * DAY)
    const finished = status === 'completed'
    const end = finished ? new Date(start.getTime() + int(env, 40, 70) * DAY) : null
    seed.campaigns.push({
      id,
      tenantId: env.tenantId,
      name,
      platform,
      objective,
      status,
      budget,
      startDate: start.toISOString(),
      endDate: end ? end.toISOString() : new Date(env.now.getTime() + 45 * DAY).toISOString(),
      ownerId: (owners.length > 0 ? pick(env, owners) : users[0]).id,
      tags: chance(env, 0.5) ? [pick(env, ['festive', 'q4', 'brand', 'retargeting'])] : [],
      archivedAt: null,
      createdAt: start.toISOString(),
    })

    const campaignAds: Ad[] = []
    adSetNames.forEach((setName, setIndex) => {
      const adSetId = seedId(env, 'adset', `${index + 1}-${setIndex + 1}`)
      seed.adSets.push({
        id: adSetId,
        tenantId: env.tenantId,
        campaignId: id,
        name: setName,
        platformId: `${platform}-as-${int(env, 10000, 99999)}`,
        status: status === 'draft' ? 'draft' : status,
        createdAt: start.toISOString(),
      })
      for (let adIndex = 0; adIndex < 2; adIndex += 1) {
        const ad: Ad = {
          id: seedId(env, 'ad', `${index + 1}-${setIndex + 1}-${adIndex + 1}`),
          tenantId: env.tenantId,
          adSetId,
          campaignId: id,
          name: AD_NAMES[(setIndex * 2 + adIndex) % AD_NAMES.length],
          platformId: `${platform}-ad-${int(env, 10000, 99999)}`,
          status: status === 'draft' ? 'draft' : status,
          createdAt: start.toISOString(),
        }
        campaignAds.push(ad)
        seed.ads.push(ad)
      }
    })

    if (draft) return
    const stop = end && end < env.now ? end : env.now
    const days = Math.max(1, Math.floor((stop.getTime() - start.getTime()) / DAY))
    const perAdDay = (budget * spendPct) / 100 / days / campaignAds.length
    for (const ad of campaignAds) {
      const weight = int(env, 70, 130) / 100
      for (let day = 0; day < days; day += 1) {
        const date = new Date(start.getTime() + day * DAY)
        const amount = Math.round(perAdDay * weight * (int(env, 70, 130) / 100))
        if (amount <= 0) continue
        seed.spendEntries.push({
          id: seedId(env, 'spend', `${ad.id}-${dateKey(date)}`),
          tenantId: env.tenantId,
          campaignId: id,
          adSetId: ad.adSetId,
          adId: ad.id,
          date: dateKey(date),
          amount,
          currency: 'INR',
          source: platform === 'offline' || platform === 'other' ? 'manual' : 'synced',
          notes: '',
        })
      }
    }
  })
  return seed
}
