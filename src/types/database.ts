export interface Package {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Channel {
  id: string
  package_id: string
  channel_key: string
  name: string
  logo: string
  servers: ChannelServer[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ChannelServer {
  url: string
  name: string
  enabled?: boolean
}

export interface LiveEvent {
  id: string
  team1_name: string
  team1_logo: string | null
  team2_name: string
  team2_logo: string | null
  match_time: string
  event_time: string
  event_end_time: string | null
  league: string
  commentator: string
  channel_key: string
  channel_name: string
  sort_order: number
  created_at: string
}

export interface AppSystem {
  id: string
  type: "popup" | "maintenance" | "social_popup" | "update"
  enabled: boolean
  title: string
  message: string
  button_text: string
  button_action: string
  update_url: string | null
  app_version: string | null
  latest_version: string | null
  force_update: boolean
  end_time: string | null
  closable: boolean
  created_at: string
  updated_at: string
}

export type AppSystemType = AppSystem["type"]

export interface DeviceSession {
  id: string
  device_id: string
  device_name: string
  platform: string | null
  app_version: string | null
  device_type: string | null
  is_banned: boolean
  first_seen: string
  last_seen: string
  android_version: string | null
  sdk_version: string | null
  brand: string | null
  manufacturer: string | null
  is_tv: boolean
  is_tablet: boolean
  screen_width: number | null
  screen_height: number | null
  screen_dpi: number | null
  screen_shortest_side: number | null
  screen_category: string | null
  orientation: string | null
  model: string | null
  build_number: string | null
  /* Device Intelligence fields (from Flutter upgrade) */
  country: string | null
  country_code: string | null
  region: string | null
  city: string | null
  timezone: string | null
  language: string | null
  connection_type: string | null
  isp_name: string | null
  integrity_token: string | null
  security_fingerprint: string | null
}

export interface DevicePresence {
  id: string; device_id: string; is_online: boolean; first_open_at: string;
  last_open_at: string; last_seen_at: string; closed_at: string | null;
  total_opens: number; created_at: string; updated_at: string
}

export interface DevicePresenceStatus {
  device_id: string; last_seen_at: string; realtime_online: boolean
}

export interface DeviceWithPresence extends DeviceSession {
  presence?: DevicePresence | null
  presence_status?: DevicePresenceStatus | null
  realtime_online?: boolean
  total_opens?: number
  last_open_at?: string
  last_seen_at?: string
}

export interface PlayerPresence {
  id: string
  device_id: string
  player_state: "opened" | "playing" | "buffering" | "closed" | "heartbeat" | null
  channel_key: string | null
  package_name: string | null
  started_at: string | null
  updated_at: string
}

export interface DeviceActivityEvent {
  id: string
  device_id: string
  device_name: string
  event_type: "app_open" | "channel_enter" | "package_open" | "player_start" | "player_close" | "heartbeat"
  metadata: Record<string, string> | null
  created_at: string
}

export interface DeviceIntelligenceData {
  overview: {
    total_devices: number
    online_devices: number
    offline_devices: number
    new_today: number
    new_this_week: number
    active_devices: number
    watching_streams: number
    in_player: number
  }
  presence_summary: {
    online_now: number
    recently_active: number
    offline: number
  }
  activity_feed: DeviceActivityEvent[]
  devices_by_country: { country: string; count: number; country_code: string | null }[]
  devices_by_city: { city: string; count: number }[]
  isp_analytics: { isp: string; count: number; online: number; offline: number }[]
  connection_types: { type: string; count: number }[]
  app_versions: { version: string; count: number }[]
  player_stats: {
    watching_now: number
    buffering_now: number
    opens_today: number
    avg_session_minutes: number
  }
  security_summary: {
    total_verified: number
    total_unverified: number
    flagged_devices: number
  }
}

export interface DashboardAnalytics {
  total_packages: number; active_packages: number; total_channels: number;
  active_channels: number; total_events: number; channel_keys: number;
  total_devices: number; active_devices: number; online_devices: number;
  offline_devices: number; total_tvs: number; total_tablets: number;
  total_phones: number; maintenance_active: boolean;
  popup_active: boolean; social_popup_active: boolean; update_active: boolean;
  latest_sessions: DeviceSession[]
}
