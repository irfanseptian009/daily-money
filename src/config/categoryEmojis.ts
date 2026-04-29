import { TransactionType } from "../types";

export const DEFAULT_EXPENSE_EMOJI = "💸";
export const DEFAULT_INCOME_EMOJI = "💰";

export const CATEGORY_EMOJI_OPTIONS = [
  "🍽️", "🚗", "🛍️", "📄", "🎬", "🏥", "🎓", "🎁", "💼", "💻",
  "📈", "💵", "👛", "🚆", "🏠", "✈️", "🧺", "💳", "🧰", "🎮",
  "🎟️", "☕", "🛒", "📦", "💡", "📱", "🐾", "🎵", "🧾", "🍔",
];

const LEGACY_ICON_TO_EMOJI: Record<string, string> = {
  "food-fork-drink": "🍽️",
  "car-outline": "🚗",
  "shopping-outline": "🛍️",
  "file-document-outline": "📄",
  "movie-open-outline": "🎬",
  "medical-bag": "🏥",
  "school-outline": "🎓",
  "shape-outline": "📦",
  "briefcase-outline": "💼",
  laptop: "💻",
  "chart-line": "📈",
  "gift-outline": "🎁",
  "cash-plus": "💵",
  "wallet-outline": "👛",
  train: "🚆",
  "home-outline": "🏠",
  airplane: "✈️",
  "basket-outline": "🧺",
  "credit-card-outline": "💳",
  "account-cash-outline": "💵",
  tools: "🧰",
  "gamepad-variant-outline": "🎮",
  "ticket-outline": "🎟️",
  "coffee-outline": "☕",
  "shopping-music": "🛒",
  "cash-minus": "💸",
};

export const normalizeCategoryEmoji = (icon: string | undefined, type: TransactionType): string => {
  if (!icon || !icon.trim()) {
    return type === TransactionType.INCOME ? DEFAULT_INCOME_EMOJI : DEFAULT_EXPENSE_EMOJI;
  }

  const trimmed = icon.trim();
  if (CATEGORY_EMOJI_OPTIONS.includes(trimmed)) return trimmed;
  if (LEGACY_ICON_TO_EMOJI[trimmed]) return LEGACY_ICON_TO_EMOJI[trimmed];

  return trimmed;
};
