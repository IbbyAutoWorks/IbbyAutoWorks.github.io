// The job book: owner and technician manuals for this app. Each section says what
// a screen or feature is for, when to use it, and the exact steps, with links to it.

export type ManualLink = { label: string; href: string };
export type ManualSection = {
  id: string;
  title: string;
  what: string;
  when?: string;
  steps?: string[];
  tips?: string[];
  links?: ManualLink[];
};
export type ManualChapter = { id: string; title: string; sections: ManualSection[] };

const jobWorkflow: ManualSection[] = [
  {
    id: "step-accept",
    title: "Step 1 - Accept job",
    what: "Lists jobs the owner has marked Accepted, Estimate Sent, or Scheduled. Pick the one you are working.",
    when: "Start of every job.",
    steps: [
      "Open Service and tap the job card (shows #id, customer, vehicle, services, and due window).",
      "Read the estimate note under the list - it says what parts and labor were quoted.",
      "Tap Next to move to Drive."
    ],
    tips: ["If the list says \"No accepted jobs ready\", the owner has not accepted the request yet - new customer requests start as Requested and must be accepted on the Dashboard first."],
    links: [{ label: "Open Service", href: "/service" }]
  },
  {
    id: "step-drive",
    title: "Step 2 - Drive",
    what: "Address, map, call button, route, the \"on my way\" notice, and the business mileage log.",
    steps: [
      "Tap Call customer if you need to confirm the location.",
      "Tap Open route for Google Maps turn-by-turn.",
      "Tap Notify customer on my way - this sets the job to En Route and logs it.",
      "Enter the trip miles and tap Log trip. Every trip logged here becomes a mileage deduction on Taxes & books."
    ]
  },
  {
    id: "step-walkaround",
    title: "Step 3 - Walkaround",
    what: "Document the vehicle before you touch it: photo, exterior, lights, tires, jack points, and under-hood checks, plus tire, brake and battery measurements.",
    steps: [
      "Tap Photograph this vehicle and take a clear 3/4 front photo. It becomes the picture for this job and the customer's record.",
      "Work down each checklist: mark green / yellow / red and tap the camera icon when you captured a photo of an item.",
      "Fill in measurements (tread depth, PSI, pad thickness, rotor thickness, battery voltage, leaks, rust).",
      "Tap Walkaround complete when done."
    ],
    tips: ["Note existing damage before moving or lifting the car - it protects the shop if a customer later claims damage."]
  },
  {
    id: "step-preinspect",
    title: "Step 4 - Pre inspect (and trouble codes)",
    what: "Lifted under-vehicle inspection plus the trouble-code lookup for this vehicle.",
    steps: [
      "Lift on verified jack points and work the under-vehicle checklist.",
      "Type scan-tool codes into Trouble codes (for example P0300 P0171) and tap Look up.",
      "Read the meaning: it is matched to this vehicle's make. A red note means the database has no definition for this make - use the search links instead of another brand's meaning.",
      "Tap Save codes to work order so the owner and customer record see them."
    ],
    tips: ["Manufacturer codes (P1xxx, B1xxx...) differ by brand. Always confirm with live data and pinpoint tests before replacing parts."]
  },
  {
    id: "step-parts",
    title: "Step 5 - Parts & supplies",
    what: "Approved parts with store links, extra part requests, supply/tool requests, and the Lewiston-Auburn parts and dealer directory.",
    steps: [
      "For each part, open a supplier link - the search already includes year, make, model and engine. RockAuto opens on this exact vehicle's catalog.",
      "Dealer-only part? Use the dealer parts link (tap to call) - have the VIN ready.",
      "Need something not on the job? Add a part request with the reason; the owner approves it on the Dashboard.",
      "Need consumables, tools or PPE? Use the supply request and tap Send request to admin.",
      "The Lewiston-Auburn parts stores and dealer parts desks (tap to call) are listed at the bottom of this step, with this vehicle's dealer highlighted."
    ]
  },
  {
    id: "step-logistics",
    title: "Step 6 - Logistics",
    what: "Track the parts situation: waiting, rescheduled, or picked up.",
    steps: [
      "Waiting on parts sets the job to Waiting Parts so the owner sees it.",
      "Reschedule job sets it back to Scheduled.",
      "Parts picked up moves you on to Start job."
    ]
  },
  {
    id: "step-start",
    title: "Step 7 - Start job",
    what: "Final readiness check plus the vehicle spec sheet (torques, fluids, capacities, filters) before you begin work.",
    steps: [
      "Check the spec sheet for every torque and fluid you will need (see Specs below).",
      "Add a start-job note if anything changed.",
      "Tap Start job - this records the start time for labor-hour stats."
    ]
  },
  {
    id: "step-finish",
    title: "Step 8 - Finish job",
    what: "Final safety check, reminders (30-mile wheel re-torque, next oil service), spec sheet, and measurements.",
    steps: [
      "Torque wheels to spec, verify fluids, lights, leaks, and road-ready condition.",
      "Add a finish note.",
      "Tap Finish job. The job becomes Awaiting Payment - it is NOT complete until payment is recorded."
    ]
  },
  {
    id: "step-billing",
    title: "Step 9 - Billing",
    what: "Collect payment and close the job.",
    steps: [
      "Card payment: enter the amount, tap Charge card with Stripe, then Open checkout on your phone or Copy link for customer. When Stripe confirms the payment the job completes automatically on every device.",
      "Cash, check, PayPal, invoice or payment plan: choose the method, enter amount and reference, tap Record payment and complete.",
      "The payment shows as \"Paid by ...\" and the job moves to Complete."
    ]
  }
];

const vehicleSections: ManualSection[] = [
  {
    id: "vehicle-picker",
    title: "Picking the vehicle",
    what: "Every make and model since 1980 (including heavy-duty trucks and vans), with engine/drivetrain versions for 1984+.",
    steps: [
      "Choose Year, then Make, then Model. If something is missing, choose Other (type it).",
      "Choose the Engine / version (for example \"RAV4 AWD - Auto (S8), 4 cyl, 2.5 L\"). Heavy-duty trucks have no EPA list - type the engine.",
      "Fill in trim, drive, engine size, cylinders and transmission if you know them. Everything stays editable."
    ]
  },
  {
    id: "vin-scan",
    title: "Scanning or decoding a VIN",
    what: "Fills year, make, model, trim, engine, drive, transmission and fuel automatically.",
    steps: [
      "Tap Scan VIN and point the phone at the barcode on the driver door jamb sticker. It reads Code 39, QR and Data Matrix labels.",
      "No barcode? Aim at the printed VIN (windshield plate or registration) and tap Read printed VIN.",
      "Or type the 17 characters and tap Decode VIN.",
      "Check the result and correct anything that is off."
    ],
    tips: [
      "Only VINs with a valid check digit are accepted, so a misread character is caught. A typed VIN with a bad check digit shows a warning.",
      "The camera needs the site opened over https (or on the shop computer itself) and camera permission allowed."
    ]
  },
  {
    id: "specs",
    title: "Specs: torques, fluids, capacities",
    what: "The shop spec library keeps one sheet per year/make/model/engine. Whatever one person looks up, everyone gets on every future job for that vehicle.",
    when: "Before any job that needs a torque, capacity, fluid type, filter or part number.",
    steps: [
      "Open the spec sheet (Start job or Finish job step, or after Fix / complete vehicle).",
      "If a value is filled in, check its source and who entered it.",
      "If it says Not in library yet, tap the search icon on that row - it searches that exact spec for this vehicle. The research links at the top open the owner's manual, CarCareKiosk, StartMyCar, iFixit and more.",
      "Tap the pencil, enter the value, where it came from (for example \"Owner's manual p. 412\"), and the link. Save."
    ],
    tips: [
      "Never guess a torque or capacity. If you can't find a source you trust, call the dealer parts or service desk.",
      "Recalls for the year/make/model show in red at the top - check whether this VIN is affected."
    ]
  },
  {
    id: "photos",
    title: "Vehicle pictures",
    what: "Each job shows the best picture available: the photo of this customer's car, else the shop default for that year/model, else a reference photo.",
    steps: [
      "Tap Photograph this vehicle on the Walkaround step.",
      "Owner only: tap Default for <year make model> or Default for all <make model> to make that photo the picture for every matching vehicle."
    ]
  }
];

export const techManual: ManualChapter[] = [
  {
    id: "start",
    title: "Getting started",
    sections: [
      {
        id: "sign-in",
        title: "Signing in",
        what: "Technicians sign in with their own account. The owner gives that account technician access.",
        steps: [
          "Open the Account page and create an account with your email (first time only).",
          "Ask the owner to add your email under Owner area - Team.",
          "Sign in again - the Service tab appears."
        ],
        links: [{ label: "Account / sign in", href: "/account" }]
      },
      {
        id: "what-you-see",
        title: "What technicians can and can't open",
        what: "You can open the Service portal, every job on the shared board, specs, trouble codes, parts and the directory. Pricing, payments setup, expenses, business stats and settings are owner-only.",
        tips: ["The job board is shared live: what you change on your phone shows on the owner's screen within seconds."]
      }
    ]
  },
  { id: "workflow", title: "The 9-step job workflow", sections: jobWorkflow },
  { id: "vehicle", title: "Vehicles, specs, codes and photos", sections: vehicleSections },
  {
    id: "help",
    title: "When something doesn't work",
    sections: [
      { id: "no-jobs", title: "My job isn't in the list", what: "Only Accepted, Estimate Sent and Scheduled jobs appear in step 1.", steps: ["Ask the owner to accept the request on the Dashboard.", "Pull down / switch back to the app tab - boards refresh on focus and every minute."] },
      { id: "camera", title: "Camera won't open", what: "The browser blocked the camera.", steps: ["Make sure you opened the https site (or the shop computer's local address).", "Allow camera access for the site in your browser settings and try again.", "You can always type the VIN instead."] },
      { id: "spec-save", title: "Can't save a spec", what: "Spec saving needs a signed-in technician or owner account.", steps: ["Sign out and back in.", "If it still fails, tell the owner - your account may not have technician access."] }
    ]
  }
];

export const ownerManual: ManualChapter[] = [
  {
    id: "overview",
    title: "How the shop runs in this app",
    sections: [
      {
        id: "flow",
        title: "A job from start to finish",
        what: "Customer request -> owner accepts -> tech works the 9 steps -> payment -> complete -> stats and taxes update automatically.",
        steps: [
          "A customer submits Request (or you enter a phone/in-person job with New work order).",
          "It appears on the Dashboard as Requested. Review it, then set Accepted or Scheduled.",
          "The tech (or you) picks it up in Service and works it through Finish job.",
          "Billing records the payment (Stripe completes it automatically).",
          "Business and Taxes & books update from the shared board."
        ],
        links: [{ label: "Dashboard", href: "/admin" }, { label: "New work order", href: "/admin/new" }, { label: "Service", href: "/service" }]
      },
      {
        id: "sync",
        title: "The shared board",
        what: "Every device reads and writes the same work orders in Supabase. Changes show live; boards also refresh when the app comes back into focus and every minute.",
        tips: ["Customers and guests can submit requests but cannot see or change anyone else's jobs.", "If two people change the same job at the same moment, the most recent change wins."]
      }
    ]
  },
  {
    id: "dashboard",
    title: "Dashboard and work orders",
    sections: [
      {
        id: "dashboard-board",
        title: "Work orders",
        what: "All jobs with status filters, the schedule strip, and the selected job's details.",
        steps: [
          "Use the status filter buttons to narrow the list.",
          "Tap Open on a job to see customer, vehicle, services, agreements, parts and history.",
          "Set the status with the status buttons. Accepted / Estimate Sent / Scheduled make it appear for techs.",
          "Edit customer details and tap Save customer updates."
        ],
        links: [{ label: "Dashboard", href: "/admin" }]
      },
      {
        id: "approvals",
        title: "Part and supply requests from techs",
        what: "When a tech requests a part or supplies, it shows on the job for you to act on.",
        steps: [
          "Part requests: Approve, Deny, Ordered, or Ready for pickup - the tech sees the status.",
          "Supply requests: Approve, Ordered, Expensed or Deny. Approved supplies count as expenses on Taxes & books."
        ]
      },
      {
        id: "new-order",
        title: "Phone or walk-in jobs",
        what: "New work order is the same intake as the customer form without the customer-only checks, so you can create a placeholder and fill it in later.",
        links: [{ label: "New work order", href: "/admin/new" }]
      }
    ]
  },
  { id: "tech-work", title: "Doing the work yourself", sections: [
    { id: "owner-as-tech", title: "Working a job solo", what: "The owner account can do everything a technician can. Open Service and follow the same 9 steps - they are described in the Technician manual.", links: [{ label: "Technician manual", href: "/service/manual" }, { label: "Service", href: "/service" }] },
    ...vehicleSections
  ] },
  {
    id: "money",
    title: "Payments",
    sections: [
      {
        id: "collecting",
        title: "Collecting payment",
        what: "A finished job waits in Awaiting Payment until a payment is recorded (manually) or Stripe confirms one (automatically).",
        steps: ["See Step 9 - Billing in the Technician manual."]
      },
      {
        id: "stripe-webhook",
        title: "Stripe webhook (one-time setup)",
        what: "Lets Stripe tell the app a card payment went through, so jobs complete automatically.",
        steps: [
          "Stripe dashboard - Developers - Webhooks - Add endpoint.",
          "URL: https://cqdlqdzmnylywctlsklp.supabase.co/functions/v1/ibby-stripe-webhook",
          "Events: checkout.session.completed and checkout.session.async_payment_succeeded.",
          "Copy the signing secret (starts with whsec_).",
          "Supabase dashboard - Edge Functions - Secrets: add STRIPE_WEBHOOK_SECRET with that value."
        ],
        links: [{ label: "Services & accounts", href: "/admin/services" }]
      },
      {
        id: "plans-promos",
        title: "Payment plans, promotions and tax settings",
        what: "Managed in Settings: Stripe payment plans, promotion codes, and the Maine sales tax settings used by the tax estimate.",
        links: [{ label: "Settings", href: "/admin/settings" }]
      }
    ]
  },
  {
    id: "business",
    title: "Running the business",
    sections: [
      {
        id: "stats",
        title: "Business stats",
        what: "Revenue collected, jobs, average ticket, repeat customers, turnaround, busiest day, labor hours, revenue by month, per-tech and per-service results, payment methods, and every customer's history.",
        when: "Weekly check-in; before pricing changes; when deciding whether to add a helper.",
        steps: [
          "Pick the year at the top.",
          "Due for service lists customers not seen in 6 months - tap a number to call them.",
          "Export CSV gives the full customer list."
        ],
        tips: ["Revenue only counts payments actually recorded. Jobs still awaiting payment are shown separately as an estimate."],
        links: [{ label: "Business", href: "/admin/business" }]
      },
      {
        id: "taxes",
        title: "Taxes & books",
        what: "The year's income, expenses, quarterly estimate table, sales tax estimate, Stripe total, receipts and exports.",
        when: "Log expenses as they happen; review quarterly (estimated tax dates are listed); export in January.",
        steps: [
          "Log every business purchase under Log an expense and attach the receipt photo or PDF (stored privately).",
          "Approved supply requests, mileage logs and Services & accounts costs are added automatically.",
          "Set the IRS mileage rate for the year.",
          "In January: Export income + expenses (CSV), download Stripe's 1099-K, and work through the year-end checklist."
        ],
        tips: ["The sales tax line assumes everything collected was taxable. Confirm the parts/labor split with Maine Revenue Services or your accountant."],
        links: [{ label: "Taxes & books", href: "/admin/taxes" }]
      },
      {
        id: "services",
        title: "Services & accounts",
        what: "Every outside service the business runs on: Supabase, Stripe, Vercel, GitHub, Gmail, Google Cloud, Cloudflare and anything you add.",
        steps: [
          "For each service record the login email, how you log in (Google, GitHub, password), plan, cost, billing cycle and renewal date.",
          "Record where the password is kept (for example a password manager) - the app intentionally does not store passwords.",
          "Costs feed the expense total on Taxes & books."
        ],
        links: [{ label: "Services & accounts", href: "/admin/services" }]
      },
      {
        id: "team",
        title: "Adding a technician",
        what: "Gives a helper the job board and Service portal without access to the books.",
        steps: ["Have them create an account on the Account page.", "Owner area - Team: enter their email and tap Add technician.", "Remove removes their access immediately."],
        links: [{ label: "Team", href: "/admin/team" }]
      },
      {
        id: "vehicles-admin",
        title: "Vehicle pictures and the parts directory",
        what: "Set default pictures by make/model, and see Lewiston-Auburn dealer parts desks and parts stores with tap-to-call numbers.",
        links: [{ label: "Vehicles", href: "/admin/vehicles" }]
      },
      {
        id: "settings",
        title: "Settings",
        what: "Logo and colors, estimate pricing and labor rate, working days and hours, blocked dates, service area and radius, prayer time blocks, popups and reviews, inspection templates, workflow columns, payment plans, promotions and tax settings.",
        links: [{ label: "Settings", href: "/admin/settings" }]
      }
    ]
  },
  {
    id: "help",
    title: "Troubleshooting and upkeep",
    sections: [
      { id: "not-syncing", title: "A job isn't showing on another device", what: "Boards sync through Supabase.", steps: ["Make sure both devices are signed in (guests only submit).", "Switch away from the tab and back, or wait up to a minute.", "Jobs created on a device before syncing existed upload the first time a staff account opens the site there."] },
      { id: "local-app", title: "The shop computer copy of the site", what: "A copy of the app runs on the shop computer (NucBox) at port 4200, started by Windows scheduled tasks with a watchdog that restarts it if it stops.", tips: ["It lives in G:\\IbbyAutoWorks\\app. After GitHub updates it needs a rebuild to show new features."] },
      { id: "data-where", title: "Where the data lives", what: "Work orders, specs, trouble codes, pictures, receipts and accounts live in Supabase. Code lives on GitHub; the public site is served by Vercel and GitHub Pages.", links: [{ label: "Services & accounts", href: "/admin/services" }] }
    ]
  }
];
