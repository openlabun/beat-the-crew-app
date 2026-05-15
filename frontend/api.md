# Beat The Crew — API Reference

Base URL: `http://localhost:3000`

All admin endpoints require a Bearer token in the `Authorization` header unless otherwise noted.

---

## Auth

### `POST /auth/login`
Login as admin. Returns a JWT access token.

**Public — no token required**

**Body**
```json
{
  "password": "string"
}
```

**Response `201`**
```json
{
  "accessToken": "eyJhbGci..."
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `401` | Invalid password |

---

## Events

All event endpoints require a Bearer token.

### `POST /events`
Create a new event.

**Body**
```json
{
  "name": "Beat the Crew 2026"
}
```

**Response `201`**
```json
{
  "id": 1,
  "name": "Beat the Crew 2026",
  "createdAt": "2026-05-19T00:00:00.000Z"
}
```

---

### `GET /events/:id`
Get an event by ID, including all contestants and battles.

**Response `200`**
```json
{
  "id": 1,
  "name": "Beat the Crew 2026",
  "createdAt": "...",
  "contestants": [...],
  "battles": [...]
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `404` | Event not found |

---

### `POST /events/:id/contestants`
Add contestants to an event for a given group. Must be called separately for `CREW` and `INVITED`.

**Body**
```json
{
  "names": ["Alex", "Jordan", "Sam", "Taylor"],
  "group": "CREW"
}
```

> `group` must be `"CREW"` or `"INVITED"`
> `names` must have between 2 and 16 entries and be a power of 2 (2, 4, 8, or 16)

**Response `201`**
```json
{
  "count": 8
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Contestants for this group already added |
| `404` | Event not found |

---

### `PATCH /events/contestants/:contestantId`
Fix a contestant's name at any point before or during the event.

**Body**
```json
{
  "name": "Alexander"
}
```

**Response `200`**
```json
{
  "id": 3,
  "name": "Alexander",
  ...
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `404` | Contestant not found |

---

### `POST /events/:id/generate?group=`
Randomly generate the bracket for a group. Can only be called once per group.

**Query params**
| Param | Type | Values |
|-------|------|--------|
| `group` | string | `CREW` \| `INVITED` |

**Response `201`** — array of battles ordered by round and position

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Bracket already generated |
| `400` | Contestant count is not a power of 2 |
| `404` | Event not found |

---

### `POST /events/:id/reshuffle?group=`
Regenerate and reshuffle the bracket for a group. Only allowed before any battles have been played.

**Query params**
| Param | Type | Values |
|-------|------|--------|
| `group` | string | `CREW` \| `INVITED` |

**Response `201`** — reshuffled array of battles

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Cannot reshuffle while a battle is active |
| `400` | Cannot reshuffle after battles have been completed |
| `404` | Event not found |

---

### `GET /events/:id/bracket?group=`
Get the full bracket for a group.

**Query params**
| Param | Type | Values |
|-------|------|--------|
| `group` | string | `CREW` \| `INVITED` |

**Response `200`** — array of battles ordered by round and position, each including `yellowContestant`, `purpleContestant`, and `winner`

**Errors**
| Status | Description |
|--------|-------------|
| `404` | Event not found |

---

## Battles

### `GET /battles/active?eventId=`
Get the currently active battle for an event. Used by the vote page and screen to rehydrate on reconnect.

**Public — no token required**

**Query params**
| Param | Type |
|-------|------|
| `eventId` | number |

**Response `200`** — battle object or `null` if no battle is active

---

### `GET /battles/:id`
Get a battle by ID.

**Public — no token required**

**Response `200`** — battle object including contestants and winner

**Errors**
| Status | Description |
|--------|-------------|
| `404` | Battle not found |

---

### `PATCH /battles/:id/open`
Open voting for a battle. Emits `voting:opened` to all connected clients.

**🔒 Admin only**

**Response `200`** — updated battle

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Battle does not have two contestants yet |
| `400` | Voting is already open |
| `400` | Battle already has a winner |
| `404` | Battle not found |

---

### `PATCH /battles/:id/close`
Close voting and silently determine the winner or tie. Does **not** emit anything — use `/announce` to reveal the result.

**🔒 Admin only**

**Response `200`** — updated battle with `winnerId` set (or `null` if tie)

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Voting is not open |
| `404` | Battle not found |

---

### `PATCH /battles/:id/announce`
Reveal the result to all clients. Emits `battle:winner` or `battle:tie` depending on the outcome. If a winner, also advances them to the next battle in the bracket.

**🔒 Admin only**

**Response `200`** — battle object

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Voting is still open |
| `404` | Battle not found |

---

### `PATCH /battles/:id/rerun`
Reset a tied battle for another round. Clears votes and vote sessions. Emits `battle:rerun` to all clients.

**🔒 Admin only**

**Response `200`** — reset battle

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Battle already has a winner |
| `400` | Voting is still open |
| `404` | Battle not found |

---

### `PATCH /battles/:id/forfeit?side=`
Forfeit a battle on behalf of one contestant. The opposing contestant automatically advances. Emits `battle:forfeit` to all clients.

**🔒 Admin only**

**Query params**
| Param | Type | Values |
|-------|------|--------|
| `side` | string | `yellow` \| `purple` |

**Response `200`** — updated battle with winner set

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Battle already has a winner |
| `400` | Voting is still open |
| `400` | Battle does not have two contestants yet |
| `404` | Battle not found |

---

### `GET /battles/:id/tally`
Get the live vote tally for a battle. Only the admin panel should call this.

**🔒 Admin only**

**Response `200`**
```json
{
  "yellowVotes": 42,
  "purpleVotes": 37,
  "votingOpen": true
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `404` | Battle not found |

---

## Votes

### `POST /votes`
Cast a vote for a battle. The `userId` is an anonymous token generated and stored in `localStorage` on the voter's phone.

**Public — no token required**

**Body**
```json
{
  "battleId": 1,
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "votedFor": "YELLOW"
}
```

> `votedFor` must be `"YELLOW"` or `"PURPLE"`

**Response `201`**
```json
{
  "success": true
}
```

**Errors**
| Status | Description |
|--------|-------------|
| `400` | Voting is not open for this battle |
| `409` | This user has already voted in this battle |

---

## WebSocket Events

Connect to the backend via Socket.io at the base URL.

### Events emitted by the server

| Event | Payload | Who should listen |
|-------|---------|-------------------|
| `voting:opened` | `{ battleId, yellow, purple }` | Vote page, Screen |
| `battle:winner` | `{ battleId, winnerId, winnerName, yellowVotes, purpleVotes }` | Vote page, Screen |
| `battle:tie` | `{ battleId, yellow, purple }` | Vote page, Screen |
| `battle:rerun` | `{ battleId, yellow, purple }` | Vote page, Screen |
| `battle:forfeit` | `{ battleId, forfeitingName, winnerName }` | Vote page, Screen |
| `votes:updated` | `{ battleId, yellowVotes, purpleVotes }` | Admin only |

---

## DTOs

### `LoginDto`
```ts
{
  password: string  // must not be empty
}
```

### `CreateEventDto`
```ts
{
  name: string  // must not be empty
}
```

### `AddContestantsDto`
```ts
{
  names: string[]         // min 2, max 16 entries
  group: ContestantGroup  // "CREW" | "INVITED"
}
```

### `UpdateContestantDto`
```ts
{
  name: string  // must not be empty
}
```

### `CastVoteDto`
```ts
{
  battleId: number      // integer
  userId:   string      // anonymous localStorage token
  votedFor: VoteChoice  // "YELLOW" | "PURPLE"
}
```

---

## Enums

```ts
enum ContestantGroup {
  CREW    = "CREW"
  INVITED = "INVITED"
}

enum VoteChoice {
  YELLOW = "YELLOW"
  PURPLE = "PURPLE"
}
```