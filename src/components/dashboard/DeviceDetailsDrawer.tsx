"use client"

import { motion, AnimatePresence } from "framer-motion"

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: "var(--accent-gradient)" }} />
      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</h4>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-xs font-medium truncate max-w-[55%]" style={{ color: "var(--text-primary)" }}>{value ?? "—"}</span>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <SectionHeader label={label} />
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export default function DeviceDetailsDrawer({ device, onClose }: { device: any | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {device && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full overflow-y-auto"
            style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border)" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{device.device_name || "Device Details"}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{device.device_id}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Section label="General Information">
                <Field label="Device ID" value={device.device_id} />
                <Field label="Device Name" value={device.device_name} />
                <Field label="Brand" value={device.brand} />
                <Field label="Model" value={device.model} />
                <Field label="Manufacturer" value={device.manufacturer} />
                <Field label="Android Version" value={device.android_version} />
                <Field label="SDK Version" value={device.sdk_version} />
              </Section>
              <Section label="Geo Information">
                <Field label="Country" value={device.country} />
                <Field label="Country Code" value={device.country_code} />
                <Field label="Region" value={device.region} />
                <Field label="City" value={device.city} />
                <Field label="Timezone" value={device.timezone} />
                <Field label="Language" value={device.language} />
              </Section>
              <Section label="Network Information">
                <Field label="Connection Type" value={device.connection_type} />
                <Field label="ISP" value={device.isp_name} />
              </Section>
              <Section label="Presence Information">
                <Field label="First Open" value={device.first_open_at ? new Date(device.first_open_at).toLocaleString() : null} />
                <Field label="Last Open" value={device.last_open_at ? new Date(device.last_open_at).toLocaleString() : null} />
                <Field label="Last Seen" value={device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : null} />
                <Field label="Total Opens" value={device.total_opens} />
                <Field label="Realtime Online" value={device.realtime_online ? "Yes" : "No"} />
              </Section>
              <Section label="Security Information">
                <Field label="Integrity Token" value={device.integrity_token} />
                <Field label="Security Fingerprint" value={device.security_fingerprint} />
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
