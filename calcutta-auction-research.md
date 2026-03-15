# March Madness Calcutta Auction Research

## What Is a Calcutta Auction?

A Calcutta auction is a format where participants **bid on teams** in a live auction. The highest bidder "owns" a team for the duration of the tournament. All money spent at auction forms the prize pool, which is then paid out based on how far each owned team advances.

Key distinction from bracket pools: only **one person** can own any given team, but one person can own **multiple teams** with no spending cap.

---

## Setup & Format

### Participants
- Ideal: 8 participants, 8 teams each (using 64 teams, skipping First Four)
- Workable range: 4–12 participants
- Teams don't need to be distributed evenly

### Auction Process
1. Teams are auctioned sequentially, one at a time
2. Bidding order is typically random or by seed (low seeds first or high seeds first)
3. Lowest-seeded teams are often **bundled** (e.g., all four 16-seeds sold as one lot)
4. Highest bidder wins the team; that bid amount goes into the prize pool
5. Can be run in-person, via video call, or on an online platform

### No Spending Cap
Unlike fantasy drafts, there's no salary cap. You can bid as much as you want on as many teams as you want.

---

## Payout Structures

### Option 1: Percentage of Pot by Round (Most Common)

Example breakdown:
| Result | Payout |
|--------|--------|
| Champion | 26% |
| Runner-up | 14% |
| Final Four (2 teams) | 8% each |
| Elite Eight (4 teams) | 4% each |
| Sweet Sixteen (8 teams) | 2% each |
| Round of 32 winners (16 teams) | 0.75% each |

**Important:** Payouts are cumulative at the highest round reached, not additive across rounds. If a team reaches the Sweet 16, they earn 2% — not 2% + 1% + 0.75%.

### Option 2: Points System
Teams earn progressively more points per win. Prize pool is divided proportionally by total points accumulated.

### Side Pots (Optional)
- Biggest upset
- Largest loss
- First team eliminated
- Side pots can represent up to 20% of the total prize pool

---

## The Pot Size Uncertainty Problem

This is the **central structural challenge** of Calcutta auctions — and the biggest source of over/underpaying.

You are bidding a fixed dollar amount for something that pays out a *percentage of an unknown total*. Even if you know a team will win the championship, you can't know what that's worth until the very last bid is placed.

### Real-Time Pot Estimation Formula

Once bids start, you can estimate the final pot:

```
Estimated Pot = (Total $ spent so far) / (Sum of EV% of teams sold so far)
```

**Warning:** Early in the auction (first 10–15 teams), this estimate is highly unreliable. One massive overpay or underpay on an early team skews the entire projection.

### A More Practical Real-Time Metric: Price per EV%

Track this as each team sells:

```
Price per EV% = Winning bid / That team's EV%
```

If teams are selling at ~$8 per 1% of pot on average, apply that ratio to every remaining team. When a team sells way above or below that ratio, you have a signal.

### Early Bidding Dynamics

| Factor | Effect |
|--------|--------|
| Pot size unknown | Can overpay by 2x without realizing it |
| First bids set price anchors | Subsequent same-seed teams get pegged to first sale price |
| Prior year data is your only baseline | Use historical pot sizes to anchor your EV multiplier |

### Late Bidding Dynamics

| Factor | Effect |
|--------|--------|
| Pot well-estimated | Bids become more rational and calculable |
| Auction fatigue | Owners with teams lose interest → prices drop → late value |
| FOMO risk | Teamless bidders late in auction will overpay → exploit or avoid being that person |
| Supply scarcity | Last team in a hot tier (e.g., 4th No. 1 seed) sells expensive |

### Practical Approaches

1. **Use prior years as your baseline** — your group's historical pot size is the best pre-auction EV multiplier
2. **Track price-per-EV% in real time** — if early bids run hot at $12/%, adjust your ceilings upward on remaining teams
3. **Stay patient on mid-tier seeds** — 5–9 seeds often get bought at early-inflated prices; they can be bargains late
4. **Get on the board early** — don't be the bidder scrambling to buy any team late; you become the FOMO victim others exploit
5. **More participants = higher pot** — if your group is larger than prior years, scale up your pot estimate accordingly

---

## Expected Value (EV) Calculation

The core strategy tool: **EV = Σ (probability of reaching round × payout % for that round)**

Steps:
1. Get win probabilities for each team from sportsbook implied odds or simulation tools
2. Multiply each round's advancement probability by that round's payout percentage
3. Multiply result by estimated total pot size to get dollar EV
4. At auction, compare bids against EV — never pay more than EV unless you have strategic reasons

**Example:** If a team's EV is $18.75 and bidding exceeds $40, you're paying 2x+ statistical value.

**Important:** Your EV calculations are only as good as your pot size estimate. Recalculate after every 5–10 teams sell as the estimate stabilizes.

---

## Bidding Strategies

### Pre-Auction
- Calculate EV for every team before the auction starts
- Set a personal budget and stick to it
- Identify target teams and your maximum bid for each
- Plan for portfolio diversification across seed ranges

### During Auction
1. **Diversify:** Mix title contenders (1–4 seeds), mid-tier value (5–9 seeds), and longshots (11 seeds historically overperform)
2. **Avoid same-region pairs:** Owning the 1 and 2 seed in the same region caps one at 3 wins
3. **Watch for auction fatigue:** Late in the auction, bidders get complacent — undervalued teams appear
4. **Supply & demand:** The last team in a tier sells for more (less supply, same demand); target early items in hot tiers
5. **Don't overpay on favorites:** Overpaying on chalk just funds others' winnings
6. **Bid early on 11-seeds and mid-seeds:** These tend to be undervalued before the pot size is known

### Pot Size Awareness
As favorites get bought early, you can estimate the final pot size. This informs whether late-auction bids are good value.

---

## Organizer Considerations

- **Cut:** Organizers typically take 5–30% of the total prize pool (especially at country clubs or commercial events; friend groups often forgo this)
- **Team bundling:** Bundle 13–16 seeds to keep auction moving and ensure all teams are sold
- **Auction order:** Random order is most common; reverse-seed order (worst teams first) lets bidders estimate the final pot before the big-ticket items
- **Tie-breaking:** Define rules upfront for tied bids

---

## Tools & Platforms

| Tool | Use Case | Cost |
|------|----------|------|
| [BettorEdge Calcutta Value Calculator](https://www.bettoredge.com) | EV calculation, real-time bid tracking, strategy | Free |
| [PoolGenius NCAA Calcutta Tools](https://poolgenius.teamrankings.com/ncaa-calcutta-auction-tools/) | Team valuations, customizable payout rules, cheat sheets | Paid |
| [Calcutta Time](https://calcuttatime.com) | Host live online auctions, any number of players | TBD |
| [Auction Pro](https://www.auctionpro.co) | Host online Calcutta auctions with friends | TBD |
| [Calcutta League](https://calcuttaleague.com) | Full online auction platform (like ESPN fantasy drafts) | TBD |

---

## Historical Notes

- 1–4 seeds have won 36 of 39 NCAA Tournaments since 1985
- 11-seeds are historically the strongest upset seeds
- 5–9 seeds represent the best value for Elite Eight runs
- The format originated in golf but has grown significantly in March Madness adoption

---

## Sources

- [SportsbookReview: What is a March Madness Calcutta Auction](https://www.sportsbookreview.com/picks/ncaa-basketball/march-madness-calcutta-auction-tips-strategy/)
- [OddsJam: What is a Calcutta Auction for March Madness 2026](https://oddsjam.com/betting-education/calcutta-auction)
- [BettorEdge: Win Your Calcutta Auction 2026](https://www.bettoredge.com/post/march-madness-2026-win-calcutta-auction-bettoredge-calculator)
- [SportsBettingDime: Calcutta Auctions Guide](https://www.sportsbettingdime.com/guides/articles/calcutta-auctions/)
- [Wikipedia: Calcutta Auction](https://en.wikipedia.org/wiki/Calcutta_auction)
- [PoolGenius: NCAA Tournament Calcutta Pool Strategy](https://poolgenius.teamrankings.com/ncaa-calcutta-auction-tools/articles/ncaa-tournament-calcutta-pool-strategy/)
- [ActionNetwork: NCAA Tournament Calcutta Pool Rules, Payouts, Strategy](https://www.actionnetwork.com/ncaab/ncaa-tournament-calcutta-pool-rules-setup-tracker-auction)
- [Unabated: Calcutta Betting Auction Strategy Guide](https://unabated.com/articles/calcutta-betting-auction-guide)
