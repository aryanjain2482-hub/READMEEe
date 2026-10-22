# Mentor Speech Guide: RouteWise

Mentors aayenge aur poochhenge: *"Kya kiya? Kaise kiya? AI ka use kiya?"* Ye guide teeno ke liye hai.
**Golden rule: jo sach hai wahi bolna.** Mentors follow-up sawal poochhte hain, aur sach bolne wale ko hamesha acha impression milta hai.

---

## 1. Kaun kya bolega (division)

| Speaker | Topic | Kitna bolega |
|---|---|---|
| **Lakshya Yadav** | Opening + problem + live demo + frontend/map/UI | 1st: 40 sec + demo |
| **Aryan Jain** | Optimizer ("dimaag"): constraints, OR-Tools, re-optimization | 2nd: 40 sec |
| **Pallavi Garg** | Baseline, numbers/results, testing, limitations, AI tools used | 3rd: 40 sec |

Order: **Lakshya -> Aryan -> Pallavi**. Jo mentor jis banda se sawal kare, wahi jawab de. Agar atak jaye to bolo: *"Is part pe Aryan/Pallavi better explain karega."*

---

## 2. Har banda kya bole (apne shabdon me bolna, rattu mat)

### Lakshya: Opening + Demo + Frontend
> "Namaste sir/ma'am, hum Team ___ hain: Aryan Jain, Lakshya Yadav aur Pallavi Garg. Humne **RouteWise** banaya hai. Ye delivery companies ke liye hai jahan kai agents aur kai orders hote hain, deadlines aur priorities alag hoti hain. Hamari website orders ko agents me baantti hai aur sabse acha route banati hai."
>
> **Demo (30-40 sec):** "Ye Indore ka map hai. Har agent ka alag colour aur mascot hai. Main ek **urgent order add** karta/karti hoon (map pe click)... dekhiye, plan turant dobara bana. Ab main ek order **cancel** karta/karti hoon, ya agent ko **off duty** karta/karti hoon, tab bhi routes khud adjust ho gaye."
>
> **Mera kaam:** "Maine frontend me React + TypeScript + Tailwind aur Leaflet map use kiya: map, route drawing, agents/orders panels, new-order form aur cartoon theme (mascots, sounds)."

**Lakshya ko samajhna zaroori:** `MapView.tsx` map kaise draw karta hai, `App.tsx` backend ko kaise call karta hai (`api.ts`), pick-location kaise kaam karta hai.

### Aryan: Optimizer
> "Backend Python + FastAPI me hai. Asli dimaag **Vehicle Routing Problem with Time Windows** hai. Hum Google **OR-Tools** use karte hain jo ye rules ek saath dekhta hai: **vehicle capacity, delivery time window, priority (urgent ko protect karta hai) aur workload balance**. Sab ek hi cost function me hain: distance + late minutes x priority weight + balance penalty."
>
> "Jab koi event aata hai (add, cancel, delay, reassign, agent off duty), `engine.py` order data update karke poora plan dobara solve karta hai, aur ye milliseconds se seconds me hota hai. Agar OR-Tools na mile to pure-Python backup optimizer chalta hai."
>
> **Mera kaam:** "Models, sample data, distance matrix (OSRM road distance, offline fallback), solver, engine aur API endpoints."

**Aryan ko samajhna zaroori:** `objective.py` ke weights (`W_LATE`, `W_DIST`...) badalne se plan kyun badalta hai, `solver_ortools.py` me Capacity/Time/Count dimensions kya hain, `engine.py` me `optimize()` kya karta hai.

### Pallavi: Baseline + Results + Testing + AI
> "Humne apne solver ko ek **baseline** se compare kiya: orders round-robin me, bina location ya deadline dekhe. **Dono plans ek hi simulator (`evaluate.py`) se score hote hain**, isliye comparison fair hai."
>
> **Numbers:** *(dashboard se live padho, yaad mat karo)* "Sample data pe baseline lagbhag ___ km aur ___ late deliveries deta hai, RouteWise ___ km aur ___ late deliveries. Matlab lagbhag ___% kam distance." (Pehli run me ~152 km -> ~74 km aur 4 -> 0 late aaya tha.)
>
> **Testing:** "Humne tests likhe ki har order exactly ek baar serve ho, capacity cross na ho, cancel/delay/reassign sahi kaam karein."
>
> **Limitations (honestly):** "Data memory me hai, database nahi; map pe routes seedhi lines hain; re-optimization pura plan dobara banata hai."
>
> **AI:** "Humne AI tool use kiya, details neeche."

**Pallavi ko samajhna zaroori:** `baseline.py` kaise assign karta hai, `evaluate.py` late/wait kaise nikalta hai, `pytest` kaise chalate hain.

---

## 3. AI tools: sach bolo (ye part sabse zaroori hai)

Is project ka code, plan aur docs **Claude (Anthropic) ki help se** bane hain. Ye sach hai, isliye mentors ko yahi batao. Dusre tools ka naam tabhi lo jab tumne **sach me use kiya ho**.

**Seedha sach-wala statement (3 line):**
> "Humne project **Claude** ki help se plan kiya aur code generate karwaya. Phir hum teeno ne apne-apne hisse ko **padha, run kiya, test kiya aur modify kiya**: jaise weights tune kiye, UI text/colours badle aur tests chalaye. Design decisions aur testing hamari team ki hai."

**Agar tum sach me use karo to ye tools naam ke saath bol sakte ho (optional):**

| Kaam | Tool | Kab bolna |
|---|---|---|
| Code likhna/plan/explain | **Claude** | Ye already use hua hai (sach) |
| VS Code me debugging, autocomplete | **GitHub Copilot** (ya Cursor) | Sirf agar install karke use kiya |
| PPT banana | **Gamma** ya **Canva Magic Design** | Sirf agar PPT usse banao |
| Video edit + captions | **CapCut** ya **Loom** (screen record) | Sirf agar video usse banao |
| Voice-over (agar apni awaaz nahi chahiye) | **ElevenLabs** | Sirf agar use karo |
| Research / sources | **Perplexity** | Sirf agar use karo |

**Division (AI ke baare me kaun kya bole):**

| Banda | Kya bolega | Tool |
|---|---|---|
| **Aryan** | "Optimizer ka structure Claude se discuss karke banaya, phir weights aur events khud test kiye." | Claude |
| **Lakshya** | "UI aur map ka code Claude se generate karwaya, theme/text/behaviour khud run karke tweak kiya." | Claude (+ Copilot/Cursor agar use kiya) |
| **Pallavi** | "Tests, baseline aur docs me Claude ki help li; PPT/video ke liye ___ use kiya." | Claude + jo tools actually use kiye |

> Tool ka naam tabhi, jab tumne use kiya. Mentor poochhe "isme tumne kya prompt diya?" to tum bata sako.

---

## 4. Mentor visit ke liye 2 versions

**1-minute version (jab mentor jaldi me ho):**
> "RouteWise delivery routes optimize karta hai: multiple agents, deadlines, priorities aur capacity ke saath. Naya order ya cancel aane pe plan live re-optimize hota hai. Baseline se compare karke ___% kam distance aur ___ kam late deliveries. Stack: React, FastAPI, OR-Tools. Code Claude ki help se bana, hum teeno ne apna hissa run, test aur modify kiya."

**3-minute version:** Lakshya opening + demo (1 min) -> Aryan optimizer (1 min) -> Pallavi numbers + limitations + AI (1 min).

---

## 5. "Abhi tak kya kiya" status (mentor har ghante aaye to)

| Time | Kya bolna hai |
|---|---|
| ~11:30 | "Problem samajh liya, architecture decide kiya, project skeleton aur backend ka base ban raha hai." |
| ~13:00 | "Models, sample Indore data aur evaluator ho gaya; frontend scaffold aur types ready." |
| ~15:00 | "Baseline, distance matrix aur cartoon theme ready; OR-Tools solver integrate ho raha hai." |
| ~17:00 | "Map pe routes aur comparison dashboard chal rahe hain; fallback solver ready." |
| ~19:00 | "Live re-optimization events, API aur tests complete; demo rehearsal chal rahi hai." |
| ~20:30 | "Final polish, README, PPT aur video; repo clean hai." |

Har status ke saath **GitHub commit history dikha do**: teeno ke commits time ke saath dikhte hain.

---

## 6. Mentor ke possible sawal + jawab

| Sawal | Jawab |
|---|---|
| Ye problem kya hai? | Vehicle Routing Problem with time windows: kaunsa order kis agent ko, kis sequence me, deadlines aur capacity ke saath. |
| Baseline kya hai? | Round-robin: orders arrival order me agents ko, location/deadline ignore. Hum usse compare karte hain. |
| Comparison fair kaise? | Dono plans ek hi simulator se score hote hain. |
| OR-Tools kyu? | Industry-standard solver, constraints (capacity/time window) built-in. |
| Re-optimization kaise? | Event pe order data update, poora plan dobara solve; log me dikhta hai kitne orders agent badle. |
| Priority kaise? | Late hone ki penalty urgent pe 5x, high pe 2.5x; isliye urgent orders protect hote hain. |
| Workload balance? | Count dimension pe span cost / balance penalty. |
| OSRM down ho to? | Straight-line x 1.3 estimate pe fallback, app nahi rukta. |
| Database kyu nahi? | 12 ghante ka time tha; state memory me hai. Next step PostgreSQL. |
| Limitations? | Routes seedhi lines, pura plan dobara banta hai (stability nahi), approximate coordinates. |
| Scale kitna? | Demo ~16 orders; OR-Tools badi instances handle karta hai, par time limit aur real traffic data chahiye. |
| Aapne khud kya kiya? | Apne hisse ko run, test, tune aur modify kiya; decisions aur demo hamare. |
| AI use hua? | Haan, Claude ki help se. Section 3 ka statement bolo. |
| Next steps? | Live traffic, PostgreSQL, road-geometry routes, mobile app for drivers, stable re-optimization. |

---

## 7. Demo se pehle checklist (2 min)

- [ ] Backend chal raha hai: http://localhost:8000/api/health
- [ ] `"ortools": true` dikha? Agar `false` hai to bolo: "OR-Tools backup optimizer pe chal raha hai." **OR-Tools ka claim tabhi karo jab `true` ho.**
- [ ] Frontend khula hai: http://localhost:5173; **Reset demo** dabao
- [ ] Sound on/off, laptop volume theek
- [ ] Ek urgent order add karke dekha, ek cancel karke dekha
- [ ] GitHub repo tab me khula hai (commit history dikhane ke liye)
