export type EventType =
  | "session_start"
  | "card_drawn"
  | "card_passed"
  | "next_player"
  | "config_change";

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

const STORAGE_KEY = "tmt_analytics_v1";

function safeParse(json: string | null): AnalyticsEvent[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as AnalyticsEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
}

export function addEvent(type: EventType, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const events = getEvents();
  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    timestamp: Date.now(),
    data,
  };
  const next = [event, ...events].slice(0, 500);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export interface AnalyticsSummary {
  totalEvents: number;
  sessions: number;
  cardsDrawn: number;
  cardsPassed: number;
  nextPlayerActions: number;
  perLevelDrawn: Record<string, number>;
}

export function summarizeEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    totalEvents: events.length,
    sessions: 0,
    cardsDrawn: 0,
    cardsPassed: 0,
    nextPlayerActions: 0,
    perLevelDrawn: {},
  };

  for (const e of events) {
    if (e.type === "session_start") summary.sessions += 1;
    if (e.type === "card_drawn") {
      summary.cardsDrawn += 1;
      const level = String(e.data?.level ?? "unknown");
      summary.perLevelDrawn[level] = (summary.perLevelDrawn[level] ?? 0) + 1;
    }
    if (e.type === "card_passed") summary.cardsPassed += 1;
    if (e.type === "next_player") summary.nextPlayerActions += 1;
  }

  return summary;
}
