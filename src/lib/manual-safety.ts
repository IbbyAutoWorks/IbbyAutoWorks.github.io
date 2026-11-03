import type { ManualChapter } from "@/lib/manual-content";

// Shop safety and mechanic refresher, shared by the owner and technician manuals.
// General guidance only: the vehicle's service information always comes first.

const sources = (...links: [string, string][]) => links.map(([label, href]) => ({ label, href }));

export const safetyManual: ManualChapter = {
  id: "safety",
  title: "PPE and basic safety",
  sections: [
    {
      id: "ppe",
      title: "What to wear",
      what: "Match protection to the job before you start. Mobile work adds road, weather and customer-property hazards to the usual shop ones.",
      steps: [
        "Eyes: safety glasses for every job under the hood or vehicle. Goggles for fluids, grinding, batteries and overhead work.",
        "Hands: nitrile gloves for oil, coolant and brake fluid. Work gloves for sharp edges and heavy parts. Keep gloves away from spinning parts.",
        "Hearing: earplugs or muffs around air tools, grinders and long exhaust noise.",
        "Feet: closed, oil-resistant boots. Safety toe when handling wheels, brake rotors and other heavy parts.",
        "Road side: a high-visibility vest whenever you're near traffic.",
        "Clothes: no loose sleeves, jewelry or hanging hair around belts and fans."
      ],
      tips: [
        "If a helper works for you, OSHA expects a written hazard assessment, the right PPE at the employer's cost, and training before the work. See 29 CFR 1910.132.",
        "Respirators need medical evaluation, fit testing and a written program under OSHA's rules, so talk to a safety consultant before relying on one."
      ],
      links: sources(["OSHA PPE rule", "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.132"])
    },
    {
      id: "before-work",
      title: "Before every job",
      what: "A two-minute check that prevents most mobile-repair accidents.",
      steps: [
        "Look over the spot: level, firm, out of traffic, good light, and no ignition sources near fuel work.",
        "Set the parking brake and put the vehicle in Park or in gear. Take the key or fob out of reach before working near fans or belts.",
        "Let hot engines and exhaust cool before opening the cooling system or draining oil.",
        "Keep a fire extinguisher and a first-aid kit in the van, within reach.",
        "Keep customers, kids and pets well back. Say so politely before you start.",
        "If the spot isn't safe, don't do the job there. Move the vehicle or reschedule."
      ]
    },
    {
      id: "hazards",
      title: "Common hazards",
      what: "The things most likely to hurt you on a routine job.",
      steps: [
        "Brake and clutch dust: older and imported parts can contain asbestos, so treat all of it as if it does. Never blow it out with compressed air and never dry brush it. Use a wet method or a HEPA-equipped enclosure, and bag the waste.",
        "Batteries: wear eye protection, keep sparks away, and connect or disconnect in the order the vehicle's service information gives.",
        "Fuel: relieve system pressure first, work outdoors, no flames or sparks, and keep a suitable extinguisher ready.",
        "Hybrids and EVs: orange cables are high voltage. Don't touch or cut them. Don't do high-voltage work without the manufacturer's procedure, rated insulated gloves and proper training.",
        "Airbags: follow the service information for disabling them before working near the column, dash or seats.",
        "AC refrigerant: anyone servicing vehicle AC for pay must be EPA Section 609 certified, using approved recovery equipment."
      ],
      links: sources(
        ["EPA brake and clutch guidance", "https://www.epa.gov/sites/default/files/documents/brakesfinal-3-07.pdf"],
        ["EPA Section 609", "https://www.epa.gov/mvac/section-609-technician-training-and-certification-programs"],
        ["NHTSA EV and hybrid guidance", "https://www.nhtsa.gov/sites/nhtsa.gov/files/interimguide_electrichybridvehicles_012012_v3.pdf"]
      )
    },
    {
      id: "spills-waste",
      title: "Spills and waste",
      what: "You're working on someone's driveway, so leave it cleaner than you found it.",
      steps: [
        "Put a drain pan and a mat or absorbent under every fluid job.",
        "Keep used oil in a leak-proof container, free of water and chemicals, and take it to a recycling site.",
        "Drain oil filters fully before recycling or disposing of them.",
        "Keep coolant, brake fluid and solvent separate from used oil, and follow local disposal rules.",
        "Clean up spills right away with absorbent. Never rinse them toward a storm drain."
      ],
      links: sources(["EPA used oil guidance", "https://www.epa.gov/recycle/managing-reusing-and-recycling-used-oil"])
    }
  ]
};

export const basicsManual: ManualChapter = {
  id: "basics",
  title: "Jacking and mechanic basics",
  sections: [
    {
      id: "jacking",
      title: "Lifting a vehicle safely",
      what: "A jack only lifts. It never holds a vehicle up while you're under it.",
      steps: [
        "Park on firm, level ground. Asphalt softens in heat, so put a steel plate or solid board under the jack and stands if you must use it. Don't lift on gravel, dirt or a slope.",
        "Park brake on, Park or in gear, and chock the wheels staying on the ground, in both directions.",
        "Find the lift points in the owner's manual or service information. Don't guess, because the wrong spot can crush a pinch weld, floor or battery case.",
        "Check the ratings. The jack and each stand must be rated for the vehicle.",
        "Lift slowly, watching the vehicle and the jack.",
        "Set stands at the supporting points the service information shows, at matching heights, then lower the weight onto them slowly.",
        "Shake the vehicle firmly before going under. If anything moves, lift it back up and start over.",
        "To lower: clear tools and people, lift off the stands, remove them, then lower slowly."
      ],
      tips: [
        "Never go under a vehicle held only by a jack, and never use blocks, bricks or wheels as stands.",
        "Hybrids and EVs often have specific lift points to protect the battery pack. Always check first."
      ]
    },
    {
      id: "torque",
      title: "Fasteners and torque",
      what: "The spec for the exact vehicle matters more than feel. Use the Specs sheet on the job and record where each value came from.",
      steps: [
        "Find the spec first. Don't guess at one, and don't copy it from a different engine or year.",
        "Clean threads unless the service information says otherwise. Lube and threadlocker change the torque, so only use them where specified.",
        "Tighten in steps and in the specified pattern, like a star on wheels.",
        "Replace torque-to-yield bolts when the service information says they're one-time use.",
        "After a wheel job, torque lug nuts with a torque wrench and tell the customer when to have them re-checked, if the manufacturer recommends it."
      ],
      links: [{ label: "Specs on a job", href: "/service" }]
    },
    {
      id: "fluids",
      title: "Fluids",
      what: "The wrong fluid can ruin a part, so match the spec on the cap, in the owner's manual or in the service information.",
      steps: [
        "Oil: use the viscosity and approval the manufacturer lists. Fill to near the capacity, run, wait, then check the dipstick.",
        "Coolant: use the specified type and mix. Never open a hot cooling system.",
        "Brake fluid: use the DOT type on the cap and a fresh sealed bottle. It damages paint, so wipe spills right away.",
        "Transmission: use only the specified fluid and follow the fill and temperature procedure exactly.",
        "Check for leaks and top off after the first run."
      ]
    },
    {
      id: "finish-check",
      title: "Before you hand it back",
      what: "A last pass catches the mistakes that cause comebacks.",
      steps: [
        "Count your tools and check nothing's left in the engine bay.",
        "Confirm drain plugs, filters, caps and clamps are tight, and look for leaks with the engine running.",
        "Pump the brake pedal until firm before the vehicle moves, after any brake job.",
        "Verify the repair: clear codes only after the fix, then re-scan. Test drive when it's safe and the customer agrees.",
        "Reset the maintenance light if it applies. Record mileage and next service in the work order.",
        "Wipe up prints and spills, and take your waste with you."
      ]
    }
  ]
};
