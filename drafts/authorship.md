# Authorship package — DRAFT, ships post-08-19 review batch

Interview answers recorded 2026-08-04. Decisions: named authorship YES; full
name always "Jonathan Nyst" (never "Jon Nyst" — the live byline was corrected
same day, ahead of this batch); insider framing approved; location omitted
everywhere; LinkedIn link yes (URL pending); photo pending; no US-based
reviewer exists so none is claimed; only publicly-available personal info.

## 1. author.ts — replacement bio

> Jonathan Nyst built RentVsBuyMath as an independent project — for himself
> first. He spent fifteen years marketing financial products, in banking,
> fintech and payments at CMO level, which is exactly how he knows what a
> lead-generation calculator looks like from the inside. This is the
> calculator without the funnel: he is not a lender, broker or agent, the site
> takes no referral fees, and nobody is paid more if you decide to buy. The
> whole model is public — every formula documented on the methodology page,
> the engine MIT-licensed, covered by automated tests including scenarios
> computed by hand to check it.

`role` line stays as-is. `sameAs` gains the LinkedIn URL when provided.
`authorSchema` gains `image` when the photo lands.

## 2. /about — "Who is behind it" replacement section

> **The author is the user.** Jonathan Nyst is 40 and owns no property. Most
> of his friends and peers own one, some several — and for years the honest
> feeling was being behind. But "behind" assumes everyone started with the
> same chips, and nobody does: different countries, different incomes,
> different rents, different rates, different years to work with. The useful
> question was never *why am I behind* — it was *what is the right move from
> where I actually stand, today*. He couldn't find a tool that answered that
> question simply and exhaustively at the same time, so he built one.
>
> Professionally, Jonathan spent fifteen years in banking, fintech, payments
> and data-driven marketing, at CMO and Head of Marketing level. That career
> is precisely why this site looks the way it does: he has seen from the
> inside how "free calculators" are built as lead-generation funnels — tuned
> to conclude that you should buy, because someone gets paid when you do.
> RentVsBuyMath is the calculator with no funnel. Nobody here earns anything
> from your answer.
>
> **What he is not:** a lender, a broker, an agent, or a financial advisor —
> and this site is not financial advice. Where the model implements US tax
> rules, they come from primary sources, are encoded in the engine's automated
> tests, and are open for anyone to falsify — the methodology page documents
> every formula so you don't have to take anyone's word for it, including his.

## 3. Ship checklist (one move, post-08-19)

1. Replace `bio` in `src/lib/author.ts`; add LinkedIn URL to `sameAs`.
2. Replace the "Who is behind it" section in `src/pages/about.astro`.
3. Photo (if provided): `public/` asset + `image` in authorSchema + /about
   avatar block (replace the `{AUTHOR.initials}` monogram).
4. Audit check L: /about title + description still in range after edits.
5. `npm test` (bio text is not guarded, but run the suite), build,
   audit, deploy.
6. Log ONE move: metric = none ranking-related (E-E-A-T is unmeasurable
   directly); log as enabling move with predicted effect "unblocks tax
   cluster; Article schema author resolves to a verifiable Person".
7. THEN the tax cluster is unblocked (strategy cluster 4).

## Pending from Jonathan

- [ ] Exact LinkedIn URL
- [ ] Headshot photo
- [ ] Sign-off on the two texts above (or edits)
