export const formatTime = (date: Date): string => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export const formatDate = (date: Date): string => date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });

export const formatDateTime = (date: Date): string => `${formatDate(date)} ${formatTime(date)}`;
