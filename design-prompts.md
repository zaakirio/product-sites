# Image-generation prompts for product-site redesigns

One prompt per product, written for GPT image generation (paste one at a time into ChatGPT).
Each is self-contained but shares the same family DNA so the seven sites read as one fleet.

Usage tips:
Generate at portrait aspect (1024x1536) to get a full-page scroll; use landscape (1536x1024) if you only want the hero.
Treat the output as art direction, not a spec - the code model will interpret it.
Generate 2-3 variants per product and pick.

---

## bellows

High-fidelity full-page landing site design for "bellows", a developer tool, shown as a clean desktop screenshot with no browser chrome.
Aesthetic: precision industrial foundry, near-black charcoal background, tight 12-column grid, grotesque sans headlines, monospace for all numbers and code, one signature accent: ember orange like forge airflow.
Hero renders the wordmark "bellows" lowercase, tagline "MCP hands for a local model fleet", and a terminal-style panel showing a model list with quantization badges (Q4_K_M, F16) and green running-status dots.
Below the hero: a horizontal diagram of an agent connecting through MCP to a row of small server processes, drawn as thin technical linework with subtle orange glow.
A stats strip with large monospace figures: "27/27 tests", "716ms lifecycle", "6 tools".
Footer band lists sibling products as small muted wordmarks.
Mood: quiet confidence, air and pressure, machinery you trust.

---

## assay

High-fidelity full-page landing site design for "assay", a document-extraction product, desktop screenshot, no browser chrome.
Aesthetic: dark laboratory precision with warm amber/gold accent, the feel of an assayer's bench: dark background, faint paper-grain texture in one panel, grotesque sans plus monospace data, thin gold rule lines.
Hero: wordmark "assay" lowercase, tagline "Document extraction you can sign off on", and a split visual: a scanned receipt on the left with thin gold callout lines pulling fields (company, date, total) into a structured JSON panel on the right, each field carrying a small confidence badge.
Mid-page: a review-queue interface mock, a row of documents with green auto-accept ticks and one amber flagged-for-human row.
A per-field accuracy bar chart with honest uneven bars (one field visibly low), labeled in monospace: company 60.0, date 56.0, total 86.0.
Mood: metrology, sign-off culture, honesty as design.

---

## anvil

High-fidelity full-page landing site design for "anvil", a RAG support-agent product, desktop screenshot, no browser chrome.
Aesthetic: heavy and grounded, near-black iron-gray palette with a single hot spark accent (white-orange), massive solid typography, generous negative space, monospace evidence text, thin hairline dividers like machined steel.
Hero: wordmark "anvil" lowercase, tagline "Grounded answers, forged from cited sources", and a chat-answer panel where every sentence ends in small numbered citation chips [1] [2], with a sidebar of source-document cards.
Mid-page: a pipeline diagram in technical linework: docs in, hybrid retrieval, rerank, cited answer out, with a visible refusal branch labeled "cannot answer from docs" rendered proudly, not hidden.
Stats strip in monospace: "recall@10 0.74", "52 goldens", "CI gated".
Mood: weight, groundedness, nothing unsupported leaves the shop.

---

## quench

High-fidelity full-page landing site design for "quench", a CI incident-triage agent, desktop screenshot, no browser chrome.
Aesthetic: dark steel-blue palette, the moment hot metal meets water: cool cyan-blue accent with faint steam-gradient washes, grotesque sans, monospace log excerpts, red-to-green status language.
Hero: wordmark "quench" lowercase, tagline "Triage the incident. Approve the fix.", and a three-pane incident-console mock: failed CI run on the left with a red X, a streamed agent-investigation timeline in the center, and on the right a diagnosis card plus a prominent human-approval card with Approve and Reject buttons.
Mid-page: a classification row of failure-type chips (dependency, test, flaky, infra) with one highlighted, above a verbatim log line quoted in monospace as evidence.
Stats strip: "78 eval checks", "$0.0684 per triage", "writes always gated".
Mood: cool head during a red build, human hand on the lever.

---

## ingot

High-fidelity full-page landing site design for "ingot", a cost-analytics tool, desktop screenshot, no browser chrome.
Aesthetic: near-black with cast-gold accent, the visual language of poured metal and stacked bullion translated into charts, grotesque sans headlines, large monospace financial figures, restrained luxury for a terminal-native audience.
Hero: wordmark "ingot" lowercase, tagline "What did the tokens buy?", and one dominant statistic rendered huge in monospace: "$11.01 per shipped commit", beneath it a bar chart joining token spend to git commits along a shared timeline.
Mid-page: a report-card panel with cache-savings donut, model-mix bars, and an honestly labeled gray segment reading "unattributed 60%".
A small band styled like a foundry stamp: "real data, no fiction".
Stats strip: "$561.28 traced", "1.08B tokens", "51 commits".
Mood: finance meets forge, numbers with a confident decimal.

---

## crucible

High-fidelity full-page landing site design for "crucible", a model-evaluation harness, desktop screenshot, no browser chrome.
Aesthetic: the hottest of the family: near-black with molten red-orange heat gradient rising from the page bottom, grotesque sans, dense monospace result grids, the feel of a materials-testing lab.
Hero: wordmark "crucible" lowercase, tagline "What survives quantization, abliteration, and serving", and a base-vs-modified comparison panel: two columns of eval scores with green up-deltas and red down-deltas shown side by side, honest mixed results visible.
Mid-page: a refusal-profile stacked bar (complied / hedged / refused) morphing between two model versions, plus a transcript-inspector mock showing one prompt, its response, and keyword vs judge vs human verdict chips disagreeing.
Stats strip: "complied 8 → 34", "GSM8K 61 → 66", "76% grader agreement, measured".
Mood: trial by fire, evidence one click deep.

---

## flux

High-fidelity full-page landing site design for "flux", an agent-fleet control plane, desktop screenshot, no browser chrome.
Aesthetic: dark violet-on-black electric palette, one continuous glowing line as the central motif: a single trace threading through multiple nodes, otherwise austere grid, grotesque sans, monospace span data.
Hero: wordmark "flux" lowercase, tagline "One trace across the whole fleet", and a distributed-trace timeline mock: a waterfall of spans in two colors (TypeScript agent, Python agent) visibly joined into one trace, with a cross-service hop callout and a per-span cost figure ($0.0748) attached.
Mid-page: a fleet-roster table of agent cards with per-agent cost, tasks, tokens, and eval-health dots, one card flagged "unpriced" in visible amber rather than hidden.
Stats strip: "1 trace, 2 languages", "9 spans", "cost per task, bound".
Mood: the keystone, everything else in the family visible from here.
