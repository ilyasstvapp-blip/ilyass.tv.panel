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
  created_at: string
}

export interface ChannelServer {
  url: string
  name: string
}

export interface LiveEvent {
  id: string
  team1_name: string
  team1_logo: string | null
  team2_name: string
  team2_logo: string | null
  match_time: string
  league: string
  commentator: string
  channel_key: string
  channel_name: string
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
}

export interface DashboardAnalytics {
  total_packages: number
  active_packages: number
  total_channels: number
  active_channels: number
  total_events: number
  channel_keys: number
  total_devices: number
  active_devices: number
  maintenance_active: boolean
  popup_active: boolean
  social_popup_active: boolean
  update_active: boolean
  latest_sessions: DeviceSession[]
}
