import type { Company } from "../types";

export const COMPANIES: Company[] = [
  { symbol: "SYNR", name: "Synergy Dynamics Corp.", sector: "Enterprise Buzzwords", kind: "stock", tagline: "Leveraging synergies to synergize leverage.", basePrice: 184.2, volatility: 1, sharesOutstanding: 2.1e9 },
  { symbol: "CRCL", name: "Circle Back Holdings", sector: "Meetings-as-a-Service", kind: "stock", tagline: "Let's take this offline.", basePrice: 92.75, volatility: 0.9, sharesOutstanding: 1.4e9 },
  { symbol: "PVT", name: "Pivot Labs", sector: "Startups", kind: "stock", tagline: "Now an AI company. Previously a juice company.", basePrice: 41.1, volatility: 1.8, sharesOutstanding: 6.2e8 },
  { symbol: "NDL", name: "Move The Needle Inc.", sector: "Metrics", kind: "stock", tagline: "We moved it. Trust us.", basePrice: 128.4, volatility: 1.1, sharesOutstanding: 9.8e8 },
  { symbol: "PMLE", name: "Per My Last Email Corp.", sector: "Communications", kind: "stock", tagline: "As previously stated.", basePrice: 66.6, volatility: 0.8, sharesOutstanding: 1.1e9 },
  { symbol: "LHF", name: "Low Hanging Fruit Co.", sector: "Agriculture & Strategy", kind: "stock", tagline: "Easy wins, harvested daily.", basePrice: 23.5, volatility: 1.2, sharesOutstanding: 3.3e9 },
  { symbol: "DDIV", name: "Deep Dive Analytics", sector: "Consulting", kind: "stock", tagline: "We'll unpack that.", basePrice: 310.9, volatility: 0.9, sharesOutstanding: 4.5e8 },
  { symbol: "PRDM", name: "Paradigm Shift Ltd.", sector: "Thought Leadership", kind: "stock", tagline: "Shifting paradigms since Q2.", basePrice: 57.3, volatility: 1.3, sharesOutstanding: 7.7e8 },
  { symbol: "BNDW", name: "Bandwidth Partners LLP", sector: "Human Resources", kind: "stock", tagline: "Nobody has it.", basePrice: 14.2, volatility: 1.4, sharesOutstanding: 5.1e9 },
  { symbol: "THGT", name: "Thought Leader Group", sector: "LinkedIn Content", kind: "stock", tagline: "Agree? 👇", basePrice: 77.7, volatility: 1.5, sharesOutstanding: 8.8e8 },
  { symbol: "WTRF", name: "Waterfall Agile Solutions", sector: "Software", kind: "stock", tagline: "Two-year sprints.", basePrice: 39.9, volatility: 1, sharesOutstanding: 1.9e9 },
  { symbol: "OOO", name: "Out Of Office Ltd.", sector: "Travel & Leisure", kind: "stock", tagline: "Limited access to email.", basePrice: 18.3, volatility: 1.1, sharesOutstanding: 2.4e9 },
  { symbol: "KPI", name: "KPI Kingdom", sector: "Dashboards", kind: "stock", tagline: "Every number is green somewhere.", basePrice: 245.0, volatility: 0.9, sharesOutstanding: 6.0e8 },
  { symbol: "RTO", name: "Return To Office REIT", sector: "Real Estate", kind: "stock", tagline: "Your desk misses you.", basePrice: 9.45, volatility: 1.6, sharesOutstanding: 4.0e9 },
  { symbol: "ROCK", name: "Rockstar Ninja Guru Staffing", sector: "Recruiting", kind: "stock", tagline: "Hiring 10x unicorns at 0.5x pay.", basePrice: 33.3, volatility: 1.2, sharesOutstanding: 1.2e9 },
  { symbol: "LEVR", name: "Leverage & Leverage", sector: "Finance", kind: "stock", tagline: "Borrowed against itself, twice.", basePrice: 412.0, volatility: 1.1, sharesOutstanding: 3.0e8 },
  { symbol: "VIBE", name: "VibeCoin", sector: "Crypto", kind: "crypto", tagline: "Backed by vibes. Fully decentralized vibes.", basePrice: 0.842, volatility: 3.2, sharesOutstanding: 9.0e10 },
  { symbol: "SYNC", name: "SynergyToken", sector: "Crypto", kind: "crypto", tagline: "Synergy, but on the blockchain.", basePrice: 12.4, volatility: 2.8, sharesOutstanding: 2.0e9 },
  { symbol: "HODL", name: "HODLcoin", sector: "Crypto", kind: "crypto", tagline: "Selling is a skill issue.", basePrice: 3210.0, volatility: 2.4, sharesOutstanding: 2.1e7 },
  { symbol: "GRND", name: "GrindsetCoin", sector: "Crypto", kind: "crypto", tagline: "Mined at 4am after a cold plunge.", basePrice: 0.0419, volatility: 3.6, sharesOutstanding: 4.2e11 },
];

export const DEFAULT_WATCHLIST = ["SYNR", "CRCL", "PVT", "NDL", "PMLE", "LHF", "KPI", "VIBE"];

export const SECTORS_FOR_IPO = [
  "Enterprise Buzzwords",
  "Disruption",
  "Thought Leadership",
  "Meetings-as-a-Service",
  "Hustle Culture",
  "Synergy",
  "Crypto",
];
