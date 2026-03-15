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

## Research Papers & Model Foundation

### Key Academic Papers Found

#### 1. "Calcutta Auctions" — *Applied Economics*, Vol. 56 No. 44 (2023)
**The only known academic paper directly studying NCAA Calcutta auctions.**
- Used 13 years of data from a real in-person NCAA Calcutta auction
- Found **favorite-longshot bias**: top seeds are systematically overbid relative to their actual returns
- Found **middle-seed underperformance**: teams in the middle of the quality distribution (roughly 4–8 seeds) earn lower overall returns — they get bid up more than their win probability justifies
- Found that bidders **cannot correctly identify** through higher bids which teams will actually win more games, after controlling for seed quality
- Key implication: **don't overpay for 1–2 seeds; middle seeds are the trap; 11-seeds and deep longshots are undervalued**

#### 2. "Logistic Regression/Markov Chain Model for NCAA Basketball" — Georgia Tech (Kvam & Sokol)
- **Best freely available model for computing round-by-round advancement probabilities**
- Uses a Markov chain where transition probabilities = win probability in each hypothetical matchup
- Model (LRMC) outperformed all standard ranking systems in historical backtests by 1.5–5%
- Input data needed: team ratings (seed or efficiency-based)
- PDF: [isye.gatech.edu/~jsokol/ncaa.pdf](https://www2.isye.gatech.edu/~jsokol/ncaa.pdf)

#### 3. KenPom Win Probability Formula (Ken Pomeroy)
**The most practical per-game win probability model — publicly documented.**

For any neutral-court matchup between Team A and Team B:
```
Mean point spread = 1.1 × (AdjEM_A − AdjEM_B) × (AdjT_A + AdjT_B) / 200
Standard deviation = 11 points
Win probability = Φ(spread / 11)   [normal CDF]
```
Where:
- **AdjEM** = Adjusted Efficiency Margin = AdjO − AdjD (points per 100 possessions vs. avg D-I opponent at neutral site)
- **AdjT** = Adjusted Tempo (possessions per 40 minutes)
- **Φ** = standard normal CDF

KenPom ratings are at [kenpom.com](https://kenpom.com) (paid subscription, ~$20/yr). Free alternative: [barttorvik.com](https://barttorvik.com) (T-Rank, same structure).

#### 4. "March Madness Tournament Predictions" — arXiv 2503.21790 (2025)
- Logistic regression on historical NCAA data since 2013
- Key predictors: AdjOE, AdjDE, Power Rating, 2PT% Allowed
- Uses **Monte Carlo simulation** to generate full-tournament advancement probabilities
- Validated on 2022–2023 tournaments
- Most useful as a validation check against the KenPom-formula approach

#### 5. "Conformal Win Probability for NCAA Tournaments" — *American Statistician* (2023)
- Eight-covariate logistic regression: seed difference, AdjOE, AdjDE, SOS, team rank, turnovers, FTR
- Conformal inference gives well-calibrated probabilities with fewer distributional assumptions
- Benchmark: logistic regression on seed difference alone achieves ~68% game-level accuracy
- NSF-funded; open access: [par.nsf.gov/servlets/purl/10481258](https://par.nsf.gov/servlets/purl/10481258)

---

## Building the Pre-Auction Model

Given the draft is tomorrow, here is a practical, buildable model using available data.

### Step 1: Get Team Ratings
Pull KenPom or Barttorvik AdjEM + AdjT for all 64 tournament teams. Both sites post these free at selection time.

### Step 2: Compute Per-Game Win Probabilities
For any matchup A vs. B on a neutral court:
```python
import scipy.stats as stats

def win_prob(adjEM_A, adjT_A, adjEM_B, adjT_B):
    spread = 1.1 * (adjEM_A - adjEM_B) * (adjT_A + adjT_B) / 200
    return stats.norm.cdf(spread / 11)
```

### Step 3: Monte Carlo Simulation for Round-by-Round Advancement Probability
Run 100,000 simulated tournaments. For each simulation:
1. Round of 64: each team wins with `win_prob()` vs. their actual opponent
2. Round of 32: winners play each other per bracket structure
3. Continue through all 6 rounds
4. Count how often each team reaches each round

This gives `P(team X reaches round R)` for all teams and rounds.

### Step 4: Compute EV% per Team
Using your specific payout structure:
```python
payout = {
    'R32': 0.0075,    # Round of 32 win
    'S16': 0.02,      # Sweet 16
    'E8':  0.04,      # Elite Eight
    'F4':  0.08,      # Final Four
    'RU':  0.14,      # Runner-up
    'CH':  0.26,      # Champion
}

def ev_pct(advancement_probs, payout):
    # advancement_probs: dict of {round: probability of reaching that round}
    # Payout is for the HIGHEST round reached, not cumulative
    # P(exactly reaching round R) = P(reach R) - P(reach next round)
    rounds = ['R32','S16','E8','F4','RU','CH']
    ev = 0
    for i, r in enumerate(rounds):
        p_reach = advancement_probs[r]
        p_exceed = advancement_probs[rounds[i+1]] if i+1 < len(rounds) else 0
        p_exit_here = p_reach - p_exceed
        ev += p_exit_here * payout[r]
    return ev  # e.g., 0.18 means this team is worth 18% of the pot
```

### Step 5: Convert to Dollar EV
```python
estimated_pot = 2000  # Use last year's pot size as baseline

dollar_ev = ev_pct * estimated_pot
max_bid = dollar_ev  # Never bid more than this
```

### Step 6: Real-Time Pot Recalibration During Auction
As each team sells, update your pot estimate:
```python
def update_pot_estimate(bids_so_far, ev_pcts_so_far):
    # bids_so_far: list of winning bids
    # ev_pcts_so_far: EV% of those same teams
    total_spent = sum(bids_so_far)
    total_ev_pct = sum(ev_pcts_so_far)
    return total_spent / total_ev_pct  # Estimated final pot
```
Then recalculate all dollar EVs against the new pot estimate.

### Key Finding from the 2023 Academic Paper to Bake In
The Calcutta auction paper found systematic misbidding patterns:
- **1–2 seeds: bid too high** (favorite bias) → shade your max bids DOWN ~10–15% vs. pure EV
- **5–8 seeds: also bid too high** (middle-tier trap) → be selective
- **11–13 seeds and bundles: bid too low** (longshot bias) → these are the value plays

---

## Historical Seed Advancement Data (1985–2025)

Use these as a sanity check / fallback if KenPom data isn't available before the auction.

| Seed | R64 Win% | Sweet 16% | Elite 8% | Final Four% | Runner-Up% | Champion% |
|------|----------|-----------|----------|-------------|------------|-----------|
| 1    | 98.8%    | 87%       | 57%      | 40%         | 22%        | 16%       |
| 2    | 93.1%    | 63%       | 33%      | 21%         | 10%        | 4%        |
| 3    | 85.6%    | 44%       | 20%      | 11%         | 4%         | 2%        |
| 4    | 79.4%    | 38%       | 16%      | 8%          | 3%         | 1%        |
| 5    | 64.4%    | 24%       | 10%      | 5%          | 2%         | 1%        |
| 6    | 61.3%    | 19%       | 8%       | 4%          | 1%         | 0.5%      |
| 7    | 59.4%    | 16%       | 7%       | 3%          | 1%         | 0%        |
| 8    | ~50%     | 12%       | 7%       | 4%          | 2%         | 0.6%      |
| 9    | ~50%     | 6%        | 2%       | 1%          | 0%         | 0%        |
| 10   | 40.6%    | 8%        | 3%       | 1%          | 0%         | 0%        |
| 11   | 38.8%    | 7%        | 3%       | 2%          | 0.5%       | 0%        |
| 12   | 35.6%    | 6%        | 2%       | 0.5%        | 0%         | 0%        |
| 13   | 20.6%    | 1%        | 0.5%     | 0%          | 0%         | 0%        |
| 14   | 14.4%    | 1%        | 0%       | 0%          | 0%         | 0%        |
| 15   | 6.9%     | 1%        | 0%       | 0%          | 0%         | 0%        |
| 16   | 1.3%     | 0%        | 0%       | 0%          | 0%         | 0%        |

**These historical rates can be used directly in Step 4** if you don't have time to run the full simulation.

---

## Pre-Computed Seed EV% (Example — Adjust for Your Payout Structure)

Using the payout table above (Champion=26%, RU=14%, F4=8%, E8=4%, S16=2%, R32=0.75%) and historical advancement rates:

| Seed | EV% of Pot | Notes |
|------|-----------|-------|
| 1    | ~18–20%   | 4 teams; each worth ~18-20% of pot |
| 2    | ~8–10%    | Favorite-longshot bias: likely overbid |
| 3    | ~5–6%     | |
| 4    | ~3–4%     | |
| 5    | ~2–3%     | Middle-tier trap begins here |
| 6    | ~1.5–2%   | |
| 7    | ~1–1.5%   | |
| 8    | ~1–1.5%   | |
| 9    | ~0.5–1%   | |
| 10   | ~0.5–1%   | |
| 11   | ~0.5–1%   | Historically underpriced relative to performance |
| 12   | ~0.4–0.7% | |
| 13-16 bundle | ~0.3–0.5% each | Best bundle value |

**Note:** These are seed-average estimates. Individual teams vary significantly. A 5-seed KenPom top-10 team is worth much more than a 5-seed at #30.

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
- [Applied Economics (2023): Calcutta Auctions paper (13 years NCAA data)](https://www.tandfonline.com/doi/abs/10.1080/00036846.2023.2244254)
- [Georgia Tech LRMC: Logistic Regression/Markov Chain NCAA Model](https://www2.isye.gatech.edu/~jsokol/ncaa.pdf)
- [KenPom: Ratings Methodology & Win Probability](https://kenpom.com/blog/ratings-explanation/)
- [KenPom: NCAA Tournament Win Probabilities](https://kenpom.substack.com/p/ncaa-tournament-win-probabilities)
- [arXiv 2503.21790: March Madness Predictions Model (2025)](https://arxiv.org/html/2503.21790v1)
- [American Statistician (2023): Conformal Win Probability for NCAA](https://par.nsf.gov/servlets/purl/10481258)
- [NCAA.com: Records for every seed 1985–2025](https://www.ncaa.com/news/basketball-men/article/2025-04-16/records-every-seed-march-madness-1985-2025)
- [BracketOdds (U of Illinois): Seed advancement probabilities](https://bracketodds.cs.illinois.edu/seedadv.html)
