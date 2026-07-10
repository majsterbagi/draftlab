import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forecastQueue, remainingHours, MS_PER_WEEK } from './forecast.js';

const NOW = new Date('2026-07-10T12:00:00Z');

test('remainingHours odejmuje czas już przegrany i nie schodzi poniżej zera', () => {
  assert.equal(remainingHours({ hours: 30, hoursPlayed: 10 }), 20);
  assert.equal(remainingHours({ hours: 30 }), 30);
  assert.equal(remainingHours({ hours: 10, hoursPlayed: 25 }), 0);
  assert.equal(remainingHours({ hours: null }), null);
  assert.equal(remainingHours({}), null);
});

test('suma godzin i data końca kupki przy stałym budżecie', () => {
  const result = forecastQueue({
    weeklyHours: 10,
    now: NOW,
    games: [
      { id: 'a', status: 'backlog', hours: 15 },
      { id: 'b', status: 'backlog', hours: 25 },
    ],
  });

  assert.equal(result.totalHours, 40);
  assert.equal(result.weeksNeeded, 4);
  assert.equal(result.finishDate.getTime(), NOW.getTime() + 4 * MS_PER_WEEK);
});

test('kaskada: druga gra kończy się po pierwszej, playing przed backlogiem', () => {
  const result = forecastQueue({
    weeklyHours: 10,
    now: NOW,
    games: [
      { id: 'backlogowa', status: 'backlog', hours: 10 },
      { id: 'grana', status: 'playing', hours: 30, hoursPlayed: 20 },
    ],
  });

  // grana ma 10h pozostałych i idzie pierwsza, backlogowa kończy się po 2 tygodniach
  assert.equal(result.perGame.get('grana').finishDate.getTime(), NOW.getTime() + 1 * MS_PER_WEEK);
  assert.equal(result.perGame.get('backlogowa').finishDate.getTime(), NOW.getTime() + 2 * MS_PER_WEEK);
});

test('gry done/dropped nie wchodzą do prognozy', () => {
  const result = forecastQueue({
    weeklyHours: 5,
    now: NOW,
    games: [
      { id: 'a', status: 'done', hours: 100 },
      { id: 'b', status: 'dropped', hours: 50 },
      { id: 'c', status: 'backlog', hours: 5 },
    ],
  });

  assert.equal(result.totalHours, 5);
  assert.equal(result.perGame.has('a'), false);
  assert.equal(result.perGame.has('b'), false);
});

test('gra bez czasu przejścia liczy się jako nieznana i nie psuje kaskady', () => {
  const result = forecastQueue({
    weeklyHours: 10,
    now: NOW,
    games: [
      { id: 'znana', status: 'backlog', hours: 10 },
      { id: 'nieznana', status: 'backlog', hours: null },
      { id: 'kolejna', status: 'backlog', hours: 10 },
    ],
  });

  assert.equal(result.unknownCount, 1);
  assert.equal(result.totalHours, 20);
  assert.equal(result.perGame.get('nieznana').finishDate, null);
  assert.equal(result.perGame.get('kolejna').finishDate.getTime(), NOW.getTime() + 2 * MS_PER_WEEK);
});

test('budżet 0 lub pusta kupka nie dają daty', () => {
  const zeroBudget = forecastQueue({
    weeklyHours: 0,
    now: NOW,
    games: [{ id: 'a', status: 'backlog', hours: 10 }],
  });
  assert.equal(zeroBudget.finishDate, null);
  assert.equal(zeroBudget.perGame.get('a').finishDate, null);

  const empty = forecastQueue({ weeklyHours: 10, now: NOW, games: [] });
  assert.equal(empty.finishDate, null);
  assert.equal(empty.totalHours, 0);
});
