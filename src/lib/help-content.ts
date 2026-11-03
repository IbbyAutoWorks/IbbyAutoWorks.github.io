// What the help icon says about each thing on screen, and the first-run walkthroughs.
// Each audience has its own text: customers never see shop instructions.

export type HelpAudience = "customer" | "tech" | "owner";

export type HelpEntry = {
  // Tested against the label of what was tapped, then the section it sits in.
  match: RegExp;
  // Only on pages starting with this path.
  page?: string;
  title: string;
  what: string;
  how?: string[];
  manual?: string;
};

const everyone: HelpEntry[] = [
  { match: /^(open|close) menu$/i, title: "Menu", what: "Opens the list of main pages. It stays open on big screens and folds away on phones." },
  { match: /settings$/i, title: "Settings", what: "Opens your settings. It's the gear in the top corner." },
  { match: /^report a problem|^issues$|something isn.t working/i, title: "Report a problem", what: "Tells the shop something isn't working. Your contact details stay private." },
  { match: /request a feature|i have an idea/i, title: "Request a feature", what: "Suggests something new for the app." },
  { match: /privacy policy/i, title: "Privacy Policy", what: "How customer information is collected and used." },
  { match: /terms of service/i, title: "Terms of Service", what: "The rules for using the app and the shop's services." },
  { match: /^what happened/i, page: "/feedback", title: "What happened", what: "Describe what you did, what you expected, and what happened instead." },
  { match: /^email or phone/i, page: "/feedback", title: "Your contact", what: "Optional. Fill this in if you'd like a reply. It's never posted publicly." },
  { match: /^send$/i, page: "/feedback", title: "Send", what: "Sends your message to the shop." }
];

const requestSteps: HelpEntry[] = [
  { match: /^1 contact|customer contact/i, page: "/", title: "Contact", what: "Who the job is for and where to do the work.", how: ["Add a name, a phone or email, and the full address where the vehicle will be."] },
  { match: /^2 vehicle|vehicle details/i, page: "/", title: "Vehicle", what: "The vehicle being worked on. Getting this right means the right parts and price.", how: ["Scan or type the VIN to fill most of it in, or choose year, make and model yourself."] },
  { match: /^3 services|requested services|what does your vehicle need/i, page: "/", title: "Services", what: "The work needed, with a price range for each.", how: ["Search or open a category, then tap a job.", "Choose Regular, Midgrade or Performance when a job offers grades."] },
  { match: /^4 appointment|appointment and photos/i, page: "/", title: "Appointment", what: "The day and time you'd like. Only open days and hours can be chosen." },
  { match: /^5 preferences|notifications, location/i, page: "/", title: "Preferences", what: "How you'd like to hear from the shop, and what to do with replaced parts." },
  { match: /^6 agreements|agreement check-off/i, page: "/", title: "Agreements", what: "The approvals needed before work. Tap Read the full agreement to see each one." },
  { match: /^7 review|confirm the work order/i, page: "/", title: "Review", what: "One last look at everything before it's sent." },
  { match: /^scan vin/i, page: "/", title: "Scan VIN", what: "Uses the camera to read the VIN barcode, QR code or printed number.", how: ["Allow the camera, then hold it steady on the door sticker or the windshield plate.", "Check the number it found before using it."] },
  { match: /^decode vin/i, page: "/", title: "Decode VIN", what: "Looks up the typed VIN and fills in the year, make, model and engine." },
  { match: /^vin$/i, page: "/", title: "VIN", what: "The vehicle's 17-character ID. It's on the driver's door sticker, at the base of the windshield, and on the registration." },
  { match: /^(year|make|model)$/i, page: "/", title: "Year, make and model", what: "Choose these in order. Each list narrows to fit the one before it." },
  { match: /^trim|^engine|^drive$|^cylinders$|^transmission$|^fuel$/i, page: "/", title: "Vehicle details", what: "These narrow down the exact parts. Pick \"not sure\" or leave one empty if you don't know." },
  { match: /^mileage$/i, page: "/", title: "Mileage", what: "The odometer reading. It's used for service reminders." },
  { match: /^plate/i, page: "/", title: "Plate", what: "The license plate, so the vehicle's easy to find on arrival." },
  { match: /^(inspection|registration) (month|year)/i, page: "/", title: "Inspection and registration", what: "Optional. When these expire, so you can be reminded." },
  { match: /^symptoms/i, page: "/", title: "Symptoms and notes", what: "Anything that helps: noises, warning lights, when it happens." },
  { match: /installed$/i, page: "/", title: "A job with its price", what: "Tap to add this job. The range is the installed price from the lowest to the highest part grade.", how: ["Tap again to remove it."] },
  { match: /^(regular|midgrade|performance)/i, page: "/", title: "Part grade", what: "Regular is a dependable basic part. Midgrade is the common upgrade. Performance is the top option. Pick one to set the price range." },
  { match: /^(month|day|time|am \/ pm)$/i, page: "/", title: "Date and time", what: "Your preferred time. Closed days and hours can't be chosen." },
  { match: /returned|disposal|not sure/i, page: "/", title: "Replaced parts", what: "Whether you want old parts back. Choose Not sure if you haven't decided, and it'll be settled before the job." }
];

export const customerHelp: HelpEntry[] = [
  ...everyone,
  ...requestSteps,
  { match: /notify me/i, page: "/request", title: "Notify me", what: "Choose to hear about your appointment, the technician being on the way, completion, and when your next service is due." },
  { match: /coupon|offers|^code:/i, title: "Offers", what: "Current deals. Mention the code when you book, or ask when your estimate is reviewed." },
  { match: /read the full agreement/i, page: "/request", title: "Read the full agreement", what: "Opens the complete wording, right here in the app." },
  { match: /saved vehicles/i, page: "/account", title: "Saved vehicles", what: "Vehicles from your past requests. Tap one to see its work orders." },
  { match: /download report/i, page: "/account", title: "Download report", what: "Saves that work order with its bill, so you can print it or keep it for your records." },
  { match: /sign out/i, page: "/account", title: "Sign out", what: "Signs you out on this device." },
  { match: /profile and contact|^name$|^phone$|^email$|^address$/i, page: "/account/settings", title: "Your details", what: "The contact details the shop uses. Change them here if they've changed.", how: ["Tap Save customer settings when you're done."] },
  { match: /save customer settings/i, page: "/account/settings", title: "Save", what: "Saves your changes." },
  { match: /review/i, page: "/account/settings", title: "Your review", what: "Rate your service. A public review may be shown on the home page." },
  { match: /photo|upload|image/i, page: "/account", title: "Photos", what: "Add a picture of you or your vehicle to your profile." },
  { match: /request service|start a work request|new request/i, title: "Request service", what: "Starts a new repair or maintenance request. It takes about two minutes." }
];

const jobSteps: HelpEntry[] = [
  { match: /your jobs|service queue/i, page: "/service", title: "Your jobs", what: "Jobs the owner has accepted and that are still open. Tap a card to work it.", manual: "step-accept" },
  { match: /^#/, page: "/service", title: "Job card", what: "Shows the job number, customer, vehicle and status. Tap it to open the job." },
  { match: /^1 accept/i, page: "/service", title: "Step 1: Accept job", what: "Choose the job and read what was quoted.", manual: "step-accept" },
  { match: /^2 drive|^drive$/i, page: "/service", title: "Step 2: Drive", what: "Route, call button, the on-my-way notice and the mileage log.", manual: "step-drive" },
  { match: /^3 walkaround/i, page: "/service", title: "Step 3: Walkaround", what: "Record the vehicle's condition with photos before you touch it.", manual: "step-walkaround" },
  { match: /^4 pre inspect/i, page: "/service", title: "Step 4: Pre inspect", what: "Check the vehicle and look up trouble codes.", manual: "step-preinspect" },
  { match: /^5 parts/i, page: "/service", title: "Step 5: Parts and supplies", what: "Find parts at the stores and ask for anything extra the job needs.", manual: "step-parts" },
  { match: /^6 logistics/i, page: "/service", title: "Step 6: Logistics", what: "Get everything to the vehicle and confirm you're ready.", manual: "step-logistics" },
  { match: /^7 start/i, page: "/service", title: "Step 7: Start job", what: "Starts the job clock and shows the specs for this vehicle.", manual: "step-start" },
  { match: /^8 finish/i, page: "/service", title: "Step 8: Finish job", what: "Record measurements and notes, then send the job to billing.", manual: "step-finish" },
  { match: /^9 billing/i, page: "/service", title: "Step 9: Billing", what: "Enter parts and labor, take payment, and close the job.", manual: "step-billing" },
  { match: /notify customer on my way/i, page: "/service", title: "Notify customer on my way", what: "Sets the job to En Route and logs that the customer was told." },
  { match: /log trip|^miles$|^from$/i, page: "/service", title: "Mileage log", what: "Enter the miles and tap Log trip. Each trip feeds the mileage deduction on the books." },
  { match: /parts and shop supplies/i, page: "/service", title: "Parts and shop supplies", what: "The bill amount for parts and supplies, before tax. These are taxed in Maine." },
  { match: /^labor/i, page: "/service", title: "Labor", what: "The labor on the bill. Listed separately like this, it isn't taxed in Maine." },
  { match: /amount collected/i, page: "/service", title: "Amount collected", what: "What the customer pays. It fills in from parts, labor and tax, and you can change it if needed." },
  { match: /payment method/i, page: "/service", title: "Payment method", what: "How the customer paid. Choose Stripe only through the Charge card button." },
  { match: /charge card with stripe/i, page: "/service", title: "Charge card with Stripe", what: "Creates a secure card checkout for the amount above.", how: ["Open it on your phone or copy the link for the customer.", "The job completes by itself when Stripe confirms payment."] },
  { match: /record payment/i, page: "/service", title: "Record payment and complete", what: "Saves a cash, check or other payment and closes the job." },
  { match: /next step|^back$/i, page: "/service", title: "Next and Back", what: "Moves between the steps. Nothing you've saved is lost." },
  { match: /spec|torque|fluid|capacit/i, page: "/service", title: "Vehicle specs", what: "Saved torques, fluids and capacities for this vehicle, each with its source. Check the source before relying on it.", manual: "specs" },
  { match: /look up a spec|search trusted sites/i, title: "Look up a spec", what: "Searches trusted sites for this exact vehicle and shows the sentence and page each answer came from.", how: ["Check that it matches this engine and trim.", "Tap Use this, then Save to add it to the shop's library.", "For brakes, steering, suspension and wheels, confirm against a factory source."] },
  { match: /text customer|copy text/i, page: "/service", title: "Text the customer", what: "Text customer opens your phone's messages with the words filled in. Copy text lets you paste them into Google Voice." },
  { match: /find this number/i, title: "Find this part number", what: "Searches each store for this exact part number. Check the fit at the store before buying." },
  { match: /trouble code|dtc/i, page: "/service", title: "Trouble codes", what: "Type a code like P0301 to see what it means.", manual: "step-preinspect" }
];

export const techHelp: HelpEntry[] = [
  ...everyone,
  ...jobSteps,
  { match: /search jobs|vins, customers/i, title: "Search", what: "Find a job by customer, phone, VIN, plate or job number." },
  { match: /technician manual/i, title: "Technician manual", what: "Step-by-step instructions for every part of a job." },
  { match: /safety and ppe/i, title: "Safety and PPE", what: "What to wear and how to stay safe on a job.", manual: "safety" },
  { match: /jacking and shop basics/i, title: "Jacking and shop basics", what: "A refresher on lifting, torque, fluids and finishing a job.", manual: "basics" }
];

export const ownerHelp: HelpEntry[] = [
  ...everyone,
  ...jobSteps,
  ...requestSteps,
  { match: /search jobs|vins, customers/i, title: "Search", what: "Find a job by customer, phone, VIN, plate or job number." },
  // Page tabs
  { match: /^dashboard$/i, title: "Dashboard", what: "Your work orders. New customer requests land here." },
  { match: /^new work order$/i, title: "New work order", what: "Enter a job yourself, for a phone call or walk-up. You can book any time." },
  { match: /^business$/i, title: "Business", what: "Revenue, customers, technicians, and who's due for service.", manual: "stats" },
  { match: /^taxes & books$/i, title: "Taxes & books", what: "Your year at a glance, anything to check before filing, and exports for your accountant.", manual: "taxes" },
  { match: /^team$/i, title: "Team", what: "Add or remove technicians.", manual: "team" },
  { match: /^vehicles$/i, title: "Vehicles", what: "Default vehicle pictures, and local parts stores and dealer parts desks.", manual: "vehicles-admin" },
  { match: /^services & accounts$/i, title: "Services & accounts", what: "The outside services the business runs on, what they cost, and how you log in.", manual: "services" },
  { match: /^settings$|edit app settings/i, title: "Settings", what: "Hours, blocked dates, prices, coupons and branding.", manual: "settings" },
  { match: /^connections$/i, title: "Connections", what: "Where you enter keys for Gmail, spec lookup, GitHub and paid data services." },
  { match: /^feedback$/i, title: "Feedback", what: "Problems and ideas people send from the app, with their private contact details." },
  { match: /^service$/i, title: "Service", what: "Work a job step by step, the same way a technician does." },
  { match: /^account$/i, title: "Account", what: "Sign in or out, and see vehicles and reports." },
  // Connections
  { match: /send me a test email/i, page: "/admin/connections", title: "Send me a test email", what: "Sends one email to your account's address, to prove Gmail is connected." },
  { match: /google|customer emails/i, page: "/admin/connections", title: "Customer emails", what: "Connects your Gmail so the app can email customers who chose to be notified. Follow the steps on the card." },
  { match: /tavily|gemini|spec lookup/i, page: "/admin/connections", title: "Spec lookup", what: "Free keys that let the spec sheet search trusted sites and show the source of each answer." },
  { match: /mailing address/i, page: "/admin/connections", title: "Mailing address", what: "The law requires a postal address on promotional email, so coupons stay out of emails until you add one." },
  { match: /github/i, page: "/admin/connections", title: "GitHub token", what: "Lets Report a problem and Request a feature create GitHub issues." },
  // Dashboard
  { match: /^work orders$/i, page: "/admin", title: "Work orders", what: "Every job and its status. Filter at the top, tap a job to open it.", manual: "dashboard-board" },
  { match: /^(all|requested|parts search|accepted|estimate sent|scheduled|en route|on site|in progress|waiting parts|awaiting payment|complete)( \d+)?$/i, page: "/admin", title: "Status", what: "In the filter row, this shows only jobs in that status. On an open job, it moves the job to that status.", how: ["New requests start as Requested. A job has to be Accepted, Estimate Sent or Scheduled before it shows up in Service."], manual: "dashboard-board" },
  { match: /^#/, page: "/admin", title: "Job", what: "Opens this job's details, estimate, customer and history." },
  { match: /^refresh$/i, page: "/admin", title: "Refresh", what: "Pulls the latest jobs now. The board also updates by itself." },
  { match: /save customer updates/i, page: "/admin", title: "Save customer updates", what: "Saves changes to this customer's contact details on their record." },
  { match: /schedule strip/i, page: "/admin", title: "Schedule strip", what: "The upcoming appointments at a glance." },
  { match: /parts and price checks/i, page: "/admin", title: "Parts and price checks", what: "Search the supply stores for this job's parts." },
  { match: /ready to confirm|possible add-on/i, page: "/admin", title: "Add-ons", what: "Extras you found that may be needed, like slide pins on a brake job. Add them and confirm the price with the customer before the appointment." },
  // Business and taxes
  { match: /how the shop is doing|revenue by month|^technicians$|^services$|^payment methods$/i, page: "/admin/business", title: "Business numbers", what: "Money counts only once a payment's recorded, so estimates don't inflate these.", manual: "stats" },
  { match: /due for service/i, page: "/admin/business", title: "Due for service", what: "Customers not seen in 6 months. Tap a number to call." },
  { match: /export csv/i, page: "/admin/business", title: "Export CSV", what: "Downloads the customer list as a spreadsheet." },
  { match: /gross receipts/i, page: "/admin/taxes", title: "Gross receipts", what: "All money collected this year, including sales tax. It goes on Schedule C, line 1." },
  { match: /net profit/i, page: "/admin/taxes", title: "Net profit", what: "Gross receipts minus deductible expenses. Self-employment tax and estimated payments start from this." },
  { match: /self-employment/i, page: "/admin/taxes", title: "Self-employment tax estimate", what: "Social Security and Medicare on your profit: 15.3% of 92.35% of it. Income tax is separate." },
  { match: /maine sales tax|sales tax by quarter/i, page: "/admin/taxes", title: "Maine sales tax", what: "5.5% on parts and supplies from each bill. Labor listed separately isn't taxed. Jobs missing a split aren't counted until you enter one." },
  { match: /next estimated|estimated tax periods/i, page: "/admin/taxes", title: "Estimated tax", what: "The IRS and Maine dates for quarterly payments. The periods aren't calendar quarters." },
  { match: /check before filing|nothing flagged/i, page: "/admin/taxes", title: "Check before filing", what: "Anything that could make the numbers wrong. Clear these and the totals are ready for your accountant." },
  { match: /parts (&|and) supplies billed|parts billed/i, page: "/admin/taxes", title: "Parts billed", what: "Enter the parts amount before tax from the bill. The app works out the tax and treats the rest as labor." },
  { match: /schedule c/i, page: "/admin/taxes", title: "Schedule C summary", what: "Your totals by tax form line, for a sole proprietor. Check them against the form for the year you file." },
  { match: /method for|vehicle deduction/i, page: "/admin/taxes", title: "Vehicle deduction", what: "Choose the standard mileage rate or actual costs. You can't deduct both for the same vehicle, so the app only counts the one you pick." },
  { match: /export for your accountant/i, page: "/admin/taxes", title: "Export for your accountant", what: "Downloads three spreadsheets: the Schedule C summary, income, and expenses." },
  { match: /log an expense|receipts and purchases|save expense|^vendor$|^category$|^amount|^paid with$|^description$/i, page: "/admin/taxes", title: "Log an expense", what: "Record a business purchase and attach the receipt.", how: ["Choose the category that fits. Parking and tolls go under tolls-parking."] },
  { match: /attach receipt/i, page: "/admin/taxes", title: "Attach receipt", what: "Takes a photo or adds a PDF. Receipts are stored privately." },
  // Team, vehicles, services
  { match: /add technician|technician email|^technicians$/i, page: "/admin/team", title: "Add a technician", what: "Gives a helper access to Service but not the books.", how: ["They create an account first, then you enter that email here."], manual: "team" },
  { match: /remove/i, page: "/admin/team", title: "Remove", what: "Takes away this person's technician access right away." },
  { match: /default pictures/i, page: "/admin/vehicles", title: "Default pictures", what: "The picture shown for a make and model when a customer has no photo of their own." },
  { match: /parts stores and dealer/i, page: "/admin/vehicles", title: "Parts stores and dealers", what: "Local stores and dealer parts desks. Tap a number to call." },
  { match: /services & accounts|add service/i, page: "/admin/services", title: "Services & accounts", what: "The outside services the business runs on, their cost and how you log in. Passwords aren't stored here on purpose.", manual: "services" },
  // Settings
  { match: /coupons: on or off/i, page: "/admin/settings", title: "Coupon controls", what: "Turn all coupons on or off, set dates, and choose where they appear." },
  { match: /show coupons to customers/i, page: "/admin/settings", title: "Show coupons", what: "The master switch. When it's off, customers don't see a coupon anywhere." },
  { match: /start showing|stop showing/i, page: "/admin/settings", title: "Coupon dates", what: "Coupons only show between these dates. Leave them empty to always show." },
  { match: /^in the app:|^in emails|^in text|^messages:/i, page: "/admin/settings", title: "Where coupons appear", what: "Check each place you want coupons. Text coupons need the customer's agreement to promotional texts." },
  { match: /save coupon|^slug$|^code$|offer type|applies to|dollar discount|percent discount|purchase requirement/i, page: "/admin/settings", title: "A coupon", what: "Set up one offer and its code. Uncheck Active to stop offering it." },
  { match: /sync stripe coupons/i, page: "/admin/settings", title: "Sync Stripe coupons", what: "Copies your coupons to Stripe so they work at card checkout." },
  { match: /sales tax rate|local tax rate|taxable/i, page: "/admin/settings", title: "Maine tax setup", what: "The rate and what's taxed. These are already set for Maine, so only change them if the law does." },
  { match: /working days and hours|^open$|^close$|^(mon|tue|wed|thu|fri|sat|sun)$/i, page: "/admin/settings", title: "Working days and hours", what: "Customers can only request these days and hours. You can still book anything yourself." },
  { match: /blocked dates/i, page: "/admin/settings", title: "Blocked dates", what: "Tap a date to close it, for a holiday or a day off. Customers can't pick it." },
  { match: /service area|included radius|outside-area|base location/i, page: "/admin/settings", title: "Service area", what: "Where you travel and what you charge beyond it. Customers see this on the request page." },
  { match: /estimate pricing/i, page: "/admin/settings", title: "Estimate pricing", what: "Your labor rate. Every price customers see is built from it, so a change reaches them right away." },
  { match: /logo|browser icon|brand colors/i, page: "/admin/settings", title: "Look of the app", what: "Your logo and colors, shown to everyone." },
  { match: /prayer/i, page: "/admin/settings", title: "Prayer time blocks", what: "Keeps customers from booking during these times, and reminds you beforehand." },
  { match: /plan|checkout/i, page: "/admin/settings", title: "Payment plans", what: "Plans customers can buy through Stripe, like a roadside plan." },
  { match: /popup|pop-up|review|widget/i, page: "/admin/settings", title: "Home page extras", what: "The coupon pop-up's timing and wording, plus reviews and the home page message." },
  { match: /payment methods|show (stripe|apple|ach|paypal|square|cash|patreon)/i, page: "/admin/settings", title: "Payment methods", what: "Which ways of paying customers see." },
  { match: /owner manual/i, title: "Owner manual", what: "How to run the shop in this app, plus safety and mechanic basics." }
];

export function helpFor(audience: HelpAudience) {
  if (audience === "owner") return ownerHelp;
  if (audience === "tech") return techHelp;
  return customerHelp;
}

export type TourStep = { title: string; body: string; href?: string; target?: string };

export const tours: Record<HelpAudience, TourStep[]> = {
  customer: [
    { title: "Welcome to Ibby Auto Works", body: "We come to you. This quick tour shows how to get your vehicle serviced. You can skip it any time." },
    { title: "Request service", body: "Tell us who you are, what you drive and what it needs. You'll see price ranges before anything is booked.", href: "/request" },
    { title: "Pick what you need", body: "Choose your jobs, and a part grade when there's a choice. If you aren't sure what's wrong, describe it in your notes." },
    { title: "Choose a time", body: "Pick an open day and time. We'll confirm it with you before coming out." },
    { title: "Your account", body: "See your vehicles, job status and reports here, all in one place.", href: "/account" },
    { title: "Need a hand?", body: "Tap the ? button, then tap anything on the page, and we'll explain it.", target: ".help-button" }
  ],
  tech: [
    { title: "Welcome to the crew", body: "This tour shows where your work lives. You can skip it any time." },
    { title: "Your jobs", body: "Accepted jobs show up here. Tap one to start.", href: "/service", target: ".service-queue-list" },
    { title: "Nine steps, in order", body: "Each job walks from Accept through Billing, so nothing gets missed. Next and Back move between steps." },
    { title: "Specs and parts", body: "Open a job to get torques, fluids and capacities for that vehicle, search the parts stores, and request supplies." },
    { title: "Billing", body: "Enter parts and labor separately, because Maine only taxes parts when they're listed that way. Then take payment." },
    { title: "Manuals", body: "The gear in the top corner has your manual, plus safety, PPE and jacking refreshers.", href: "/service/settings" },
    { title: "Need a hand?", body: "Tap the ? button, then tap anything on the page, and it'll explain what it does.", target: ".help-button" }
  ],
  owner: [
    { title: "Welcome, boss", body: "Here's a quick look at how the shop runs from here. You can skip it any time." },
    { title: "Work orders", body: "New requests land here. Open one, check it, add anything extra it needs, and accept it. Accepted jobs go to Service.", href: "/admin" },
    { title: "New work order", body: "For phone calls and walk-ups, enter the job yourself. You can book any time, and agreements can be collected later.", href: "/admin/new" },
    { title: "Working a job yourself", body: "No tech today? Service does the whole job on your account too.", href: "/service" },
    { title: "Business", body: "See revenue, customers, technicians and who's due for service.", href: "/admin/business" },
    { title: "Taxes & books", body: "Your year at a glance, anything to check before filing, and exports for your accountant.", href: "/admin/taxes" },
    { title: "Settings", body: "Hours, blocked dates, prices, coupons and branding. Changes reach every customer's device.", href: "/admin/settings" },
    { title: "Need a hand?", body: "Tap the ? button, then tap anything on the page, and it'll explain what it does. The Owner manual has the rest.", target: ".help-button" }
  ]
};
