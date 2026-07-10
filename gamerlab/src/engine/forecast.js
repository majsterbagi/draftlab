// Silnik prognozy GamerLab — czyste funkcje, bez Reacta i DOM.
// Kolejność gier na wejściu = kolejka grania; gry "playing" liczą się przed "backlog".

export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function remainingHours(game) {
  if (typeof game.hours !== 'number' || game.hours <= 0) return null;
  const played = typeof game.hoursPlayed === 'number' ? game.hoursPlayed : 0;
  return Math.max(0, game.hours - played);
}

export function forecastQueue({ games, weeklyHours, now = new Date() }) {
  const queue = [
    ...games.filter(g => g.status === 'playing'),
    ...games.filter(g => g.status === 'backlog'),
  ];

  const perGame = [];
  let unknownCount = 0;
  let totalHours = 0;

  for (const game of queue) {
    const remaining = remainingHours(game);
    if (remaining === null) {
      unknownCount += 1;
      perGame.push({ id: game.id, remaining: null, finishDate: null });
      continue;
    }

    totalHours += remaining;
    const finishDate =
      weeklyHours > 0
        ? new Date(now.getTime() + (totalHours / weeklyHours) * MS_PER_WEEK)
        : null;
    perGame.push({ id: game.id, remaining, finishDate });
  }

  return {
    totalHours,
    unknownCount,
    finishDate:
      weeklyHours > 0 && totalHours > 0
        ? new Date(now.getTime() + (totalHours / weeklyHours) * MS_PER_WEEK)
        : null,
    weeksNeeded: weeklyHours > 0 ? totalHours / weeklyHours : null,
    perGame: new Map(perGame.map(entry => [entry.id, entry])),
  };
}
