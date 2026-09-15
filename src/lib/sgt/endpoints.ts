import { sgtGet } from "./client";

export type SgtStanding = {
  user_name?: string;
  players?: string[];
  hcp?: number;
  events?: number;
  first?: number;
  [key: string]: unknown;
};

export type SgtWgrEntry = {
  name: string;
  total: number;
  divisor: number;
  wgr: number;
  rank: number;
};

export type SgtTour = {
  tourId: number;
  name: string;
  start_date?: string;
  end_date?: string;
  active?: number;
  [key: string]: unknown;
};

export function getTours() {
  return sgtGet<SgtTour[]>("tours/list");
}

export function getTourStandings(tourId: string | number, grossOrNet?: "gross" | "net") {
  return sgtGet<SgtStanding[]>("tours/standings", { tourId, grossOrNet });
}

export function getTourStats(tourId: string | number) {
  return sgtGet<Record<string, SgtStanding[]>>("tours/stats", { tourId });
}

export function getWgrLeaderboard() {
  return sgtGet<{ status: boolean; results: SgtWgrEntry[] }>("wgr/leaderboard");
}

export function getTournaments(tourId: string | number) {
  return sgtGet<unknown[]>("tournaments/list", { tourId });
}

export function getMembers() {
  return sgtGet<unknown[]>("members/list");
}

export function getUserSgtData(username: string) {
  return sgtGet<Record<string, unknown>>("members/user-sgt-data", { username });
}
