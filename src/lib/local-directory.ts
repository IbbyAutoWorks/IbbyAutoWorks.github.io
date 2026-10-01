// Lewiston-Auburn area dealer parts desks and parts stores.
// Checked against each business's own website or official store locator in
// October 2026. Phone numbers change - the app shows the check date, and
// "confirm" marks entries whose site listed more than one number.

export type DealerContact = {
  name: string;
  brands: string[];
  address: string;
  phone: string;
  phoneLabel: string;
  website: string;
  note?: string;
};

export type PartsStoreContact = {
  name: string;
  chain: string;
  address: string;
  phone: string;
  website: string;
};

export const directoryCheckedOn = "October 2026";

export const localDealers: DealerContact[] = [
  { name: "Emerson Toyota", brands: ["Toyota", "Scion"], address: "990 Center St, Auburn, ME 04210", phone: "207-784-1348", phoneLabel: "Main (ask for parts)", website: "https://www.emersontoyota.com/" },
  { name: "Lee Honda in Auburn", brands: ["Honda"], address: "809 Center St, Auburn, ME 04210", phone: "207-600-1166", phoneLabel: "Parts", website: "https://www.leeauto.com/" },
  { name: "Lee Nissan Auburn", brands: ["Nissan"], address: "793 Center St, Auburn, ME 04210", phone: "207-784-5441", phoneLabel: "Parts", website: "https://www.leeauto.com/" },
  { name: "Lee Chrysler Jeep Dodge Ram Auburn", brands: ["Chrysler", "Jeep", "Dodge", "Ram"], address: "777 Center St, Auburn, ME 04210", phone: "207-784-5441", phoneLabel: "Parts", website: "https://www.leeauto.com/" },
  { name: "Lee GMC Truck Center", brands: ["GMC"], address: "855 Center St, Auburn, ME 04210", phone: "207-352-4614", phoneLabel: "Parts", website: "https://www.leegmc.com/" },
  { name: "Emerson Chevrolet Buick", brands: ["Chevrolet", "Buick"], address: "946 Center St, Auburn, ME 04210", phone: "207-784-3503", phoneLabel: "Parts", website: "https://www.emersonchevy.com/" },
  { name: "Rowe Ford Auburn", brands: ["Ford", "Mercury"], address: "699 Center St, Auburn, ME 04210", phone: "207-203-7907", phoneLabel: "Service (ask for parts)", website: "https://www.rowefordauburn.com/" },
  { name: "Rowe Hyundai Auburn", brands: ["Hyundai"], address: "699 Center St, Auburn, ME 04210", phone: "207-618-9686", phoneLabel: "Service (ask for parts)", website: "https://www.rowehyundaiauburn.com/" },
  { name: "Rowe Kia Auburn", brands: ["Kia"], address: "699 Center St, Auburn, ME 04210", phone: "207-355-7597", phoneLabel: "Service (ask for parts)", website: "https://www.rowekiaauburn.com/" },
  { name: "Rowe Volkswagen Auburn", brands: ["Volkswagen"], address: "699 Center St, Auburn, ME 04210", phone: "207-630-6024", phoneLabel: "Service (ask for parts)", website: "https://www.rowevwauburn.com/" },
  { name: "Evergreen Subaru", brands: ["Subaru"], address: "49 Subaru Dr, Auburn, ME 04210", phone: "207-333-6935", phoneLabel: "Parts", website: "https://www.evergreensubaru.com/" },
  { name: "Goodwin Mazda", brands: ["Mazda"], address: "195 Pleasant St, Brunswick, ME 04011", phone: "888-770-1203", phoneLabel: "Parts", website: "https://www.goodwinmazda.com/", note: "About 15 miles away; site lists several numbers - confirm" },
  { name: "Lee Toyota of Topsham", brands: ["Toyota"], address: "115 Main St, Topsham, ME 04086", phone: "207-241-2224", phoneLabel: "Sales (ask for parts)", website: "https://www.leeauto.com/", note: "Backup Toyota dealer" }
];

export const localPartsStores: PartsStoreContact[] = [
  { name: "NAPA - Coastal Auto Parts Auburn", chain: "NAPA", address: "325 Center St, Auburn, ME 04210", phone: "207-786-2220", website: "https://www.napaonline.com/en/me/auburn/store/24892" },
  { name: "NAPA - Coastal Auto Parts Lewiston", chain: "NAPA", address: "1035 Lisbon St, Lewiston, ME 04240", phone: "207-784-6951", website: "https://www.napaonline.com/en/me/lewiston/store/27997" },
  { name: "O'Reilly Auto Parts Auburn", chain: "O'Reilly", address: "128 Center St, Auburn, ME 04210", phone: "207-753-6859", website: "https://locations.oreillyauto.com/en-us/me/auburn/autoparts-4507.html" },
  { name: "O'Reilly Auto Parts Lewiston (Sabattus St)", chain: "O'Reilly", address: "485 Sabattus St, Lewiston, ME 04240", phone: "207-753-7321", website: "https://locations.oreillyauto.com/en-us/me/lewiston/autoparts-4500.html" },
  { name: "O'Reilly Auto Parts Lewiston (East Ave)", chain: "O'Reilly", address: "20 East Ave Ste 8, Lewiston, ME 04240", phone: "207-753-7328", website: "https://locations.oreillyauto.com/en-us/me/lewiston/autoparts-4531.html" },
  { name: "AutoZone Auburn", chain: "AutoZone", address: "192 Center St, Auburn, ME 04210", phone: "207-241-6060", website: "https://www.autozone.com/locations/me/auburn/192-center.html" },
  { name: "Advance Auto Parts Auburn", chain: "Advance", address: "269 Center St, Auburn, ME 04210", phone: "207-782-4371", website: "https://stores.advanceautoparts.com/me/auburn/269-center-st" },
  { name: "Advance Auto Parts Lewiston", chain: "Advance", address: "855 Lisbon St, Lewiston, ME 04240", phone: "207-795-7745", website: "https://stores.advanceautoparts.com/me/lewiston/855-lisbon-st" }
];

export function telLink(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

// The local dealer(s) for a make; brands with no L-A dealer get a map search instead.
export function dealersForMake(make: string) {
  const key = make.trim().toLowerCase();
  if (!key) return [];
  return localDealers.filter((dealer) => dealer.brands.some((brand) => brand.toLowerCase() === key));
}

export function nearestDealerSearchUrl(make: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${make} dealer parts near Lewiston ME`)}`;
}
