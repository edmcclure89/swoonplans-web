// Ported directly from the live makeherswoon.com production data.
// Trimmed to Swoon Plans' core launch markets (DMV + major metros referenced
// in site copy) to keep this deployment payload small; the full 50-metro
// dataset was built and tested locally and can be restored in a follow-up.
export interface Venue {
  name: string;
  type: 'drinks' | 'dinner' | 'dessert';
  address: string;
  phone: string;
  linkText: string;
  linkUrl: string;
  vibe: string;
  pace: 'chill' | 'high';
  budget: '$' | '$$' | '$$$' | '$$$$';
}

export interface Metro {
  name: string;
  state: string;
  venues: Venue[];
}

export const METROS: Record<string, Metro> = {
  "washington-dc": { name:"Washington, D.C. / Arlington", state:"DC", venues:[
    { name:"Northside Social", type:"drinks", address:"3211 Wilson Blvd, Arlington, VA 22201", phone:"(703) 465-0150", linkText:"Website", linkUrl:"https://www.northsidesocialva.com/", vibe:"Bustling artisan coffee and wine lounge", pace:"chill", budget:"$$" },
    { name:"Bayou Bakery", type:"drinks", address:"1515 N Courthouse Rd, Arlington, VA 22201", phone:"(703) 243-2410", linkText:"Website", linkUrl:"https://www.bayoubakeryva.com/", vibe:"Casual, lively southern cafe patio", pace:"high", budget:"$" },
    { name:"Ted's Bulletin", type:"dinner", address:"4201 Wilson Blvd, Arlington, VA 22203", phone:"(571) 312-8291", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Comfortable, energetic American classic", pace:"high", budget:"$$" },
    { name:"The Liberty Tavern", type:"dinner", address:"3195 Wilson Blvd, Arlington, VA 22201", phone:"(703) 841-9299", linkText:"Website", linkUrl:"https://thelibertytavern.com/", vibe:"Vibrant neighborhood staple", pace:"chill", budget:"$$$" },
    { name:"Green Pig Bistro", type:"dinner", address:"1025 N Fillmore St, Arlington, VA 22201", phone:"(703) 888-1920", linkText:"Website", linkUrl:"https://www.greenpigbistro.com/", vibe:"Rustic-chic French comfort bistro", pace:"chill", budget:"$$$" },
    { name:"Ambar", type:"dinner", address:"2901 Wilson Blvd, Arlington, VA 22201", phone:"(703) 875-6663", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Balkan small plates and intimate ambiance", pace:"high", budget:"$$$" },
    { name:"Lyon Hall", type:"dinner", address:"3100 Washington Blvd, Arlington, VA 22201", phone:"(703) 741-7636", linkText:"Website", linkUrl:"https://www.lyonhallva.com/", vibe:"Spacious, lively grand European brasserie", pace:"high", budget:"$$$" },
    { name:"One More Page Books", type:"dessert", address:"2200 N Westmoreland St #101, Arlington, VA 22213", phone:"(703) 306-6400", linkText:"Website", linkUrl:"https://www.onemorepagebooks.com/", vibe:"Quirky indie book and chocolate stop", pace:"chill", budget:"$" },
    { name:"Roosevelt Island", type:"dessert", address:"George Washington Memorial Pkwy, Arlington, VA 22209", phone:"(703) 289-2500", linkText:"Website", linkUrl:"https://www.nps.gov/gwmp/planyourvisit/therose.htm", vibe:"Scenic evening stroll and outdoor escape", pace:"chill", budget:"$" },
    { name:"Off the Record", type:"drinks", address:"800 16th St NW, Washington, DC 20006", phone:"(202) 638-6600", linkText:"Website", linkUrl:"https://www.hayadams.com/", vibe:"Refined below-ground political hideaway bar", pace:"chill", budget:"$$$" },
    { name:"Columbia Room", type:"drinks", address:"124 Blagden Aly NW, Washington, DC 20001", phone:"(202) 316-9396", linkText:"Website", linkUrl:"https://www.columbiaroomdc.com/", vibe:"Award-winning cocktail tasting experience", pace:"chill", budget:"$$$$" },
    { name:"Pupatella", type:"dinner", address:"5104 Wilson Blvd, Arlington, VA 22203", phone:"(571) 312-7230", linkText:"Website", linkUrl:"https://www.pupatella.com/", vibe:"Casual, lively Neapolitan pizzeria", pace:"high", budget:"$" },
    { name:"Rasika", type:"dinner", address:"633 D St NW, Washington, DC 20004", phone:"(202) 637-1222", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Elegant, buzzy modern Indian fine dining", pace:"high", budget:"$$$$" },
    { name:"Un Je Ne Sais Quoi", type:"dessert", address:"1361 Connecticut Ave NW, Washington, DC 20036", phone:"(202) 721-0099", linkText:"Website", linkUrl:"https://ujnsq.com/", vibe:"Delicate French dessert boutique", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Willard", type:"dessert", address:"1401 Pennsylvania Ave NW, Washington, DC 20004", phone:"(202) 628-9100", linkText:"Website", linkUrl:"https://washington.intercontinental.com/", vibe:"Elegant historic high-tea service", pace:"chill", budget:"$$$" }
  ]},
  "new-york": { name:"New York, NY", state:"NY", venues:[
    { name:"Refinery Rooftop", type:"drinks", address:"63 W 38th St, New York, NY 10018", phone:"(646) 664-0372", linkText:"Website", linkUrl:"https://refineryrooftop.com/", vibe:"Industrial-chic rooftop with Empire State views", pace:"high", budget:"$$$" },
    { name:"Death & Co", type:"drinks", address:"433 E 6th St, New York, NY 10009", phone:"(212) 388-0882", linkText:"Website", linkUrl:"https://deathandcompany.com/", vibe:"Moody, world-renowned craft cocktail den", pace:"chill", budget:"$$$" },
    { name:"Torrisi", type:"dinner", address:"275 Mulberry St, New York, NY 10012", phone:"(212) 254-3000", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Bustling, warm-lit iconic Nolita Italian dining", pace:"high", budget:"$$$$" },
    { name:"The Polo Bar", type:"dinner", address:"1 E 55th St, New York, NY 10022", phone:"(212) 207-8562", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Classic, ultra-exclusive clubby atmosphere", pace:"chill", budget:"$$$$" },
    { name:"Levain Bakery", type:"dessert", address:"167 W 74th St, New York, NY 10023", phone:"(917) 464-3769", linkText:"Website", linkUrl:"https://levainbakery.com/", vibe:"World-famous legendary sweet stop", pace:"chill", budget:"$" },
    { name:"Rudy's Bar & Grill", type:"drinks", address:"627 9th Ave, New York, NY 10036", phone:"(646) 707-0890", linkText:"Website", linkUrl:"https://rudysbarnyc.com/", vibe:"Divey Hell's Kitchen institution with free dogs", pace:"high", budget:"$" },
    { name:"The Dead Rabbit", type:"drinks", address:"30 Water St, New York, NY 10004", phone:"(646) 422-7906", linkText:"Website", linkUrl:"https://www.deadrabbitnyc.com/", vibe:"Acclaimed multi-level Irish pub and cocktails", pace:"high", budget:"$$" },
    { name:"Bemelmans Bar", type:"drinks", address:"35 E 76th St, New York, NY 10021", phone:"(212) 744-1600", linkText:"Website", linkUrl:"https://www.thecarlyle.com/", vibe:"Legendary elegant piano bar with murals", pace:"chill", budget:"$$$$" },
    { name:"Joe's Pizza", type:"dinner", address:"7 Carmine St, New York, NY 10014", phone:"(212) 366-1182", linkText:"Website", linkUrl:"https://www.joespizzanyc.com/", vibe:"Iconic no-frills New York slice counter", pace:"high", budget:"$" },
    { name:"Rubirosa", type:"dinner", address:"235 Mulberry St, New York, NY 10012", phone:"(212) 965-0500", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Beloved cozy Nolita Italian", pace:"high", budget:"$$" },
    { name:"Gramercy Tavern", type:"dinner", address:"42 E 20th St, New York, NY 10003", phone:"(212) 477-0777", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Refined, warm seasonal American institution", pace:"chill", budget:"$$$" },
    { name:"Dominique Ansel Bakery", type:"dessert", address:"189 Spring St, New York, NY 10012", phone:"(212) 219-2773", linkText:"Website", linkUrl:"https://dominiqueansel.com/", vibe:"Cronut creator's inventive patisserie", pace:"chill", budget:"$$" },
    { name:"Lady Mendl's Tea Salon", type:"dessert", address:"56 Irving Pl, New York, NY 10003", phone:"(212) 533-4600", linkText:"Website", linkUrl:"https://www.ladymendls.com/", vibe:"Victorian-parlor afternoon tea service", pace:"chill", budget:"$$$" }
  ]},
  "los-angeles": { name:"Los Angeles, CA", state:"CA", venues:[
    { name:"Catch LA", type:"drinks", address:"8715 Melrose Ave, West Hollywood, CA 90069", phone:"(323) 347-6060", linkText:"Website", linkUrl:"https://catchrestaurants.com", vibe:"Stunning open-air floral rooftop lounge", pace:"high", budget:"$$$$" },
    { name:"Death & Co LA", type:"drinks", address:"818 E 3rd St, Los Angeles, CA 90013", phone:"(323) 484-4897", linkText:"Website", linkUrl:"https://deathandcompany.com", vibe:"Moody arts district craft cocktail den", pace:"chill", budget:"$$$" },
    { name:"Bestia", type:"dinner", address:"2121 E 7th Pl, Los Angeles, CA 90021", phone:"(213) 514-5724", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Industrial arts district powerhouse for modern Italian", pace:"high", budget:"$$$" },
    { name:"Republique", type:"dinner", address:"624 S La Brea Ave, Los Angeles, CA 90036", phone:"(310) 362-6115", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Cathedral-like setting for French-inspired dining", pace:"chill", budget:"$$$$" },
    { name:"Bottega Louie", type:"dessert", address:"700 S Grand Ave, Los Angeles, CA 90017", phone:"(213) 802-1470", linkText:"Website", linkUrl:"https://bottegalouie.com", vibe:"Grand patisserie and macaron bar", pace:"chill", budget:"$$" },
    { name:"The Prince", type:"drinks", address:"3198 W 7th St, Los Angeles, CA 90005", phone:"(213) 389-2007", linkText:"Website", linkUrl:"https://theprincela.com/", vibe:"Old-school Koreatown dive with red booths", pace:"chill", budget:"$" },
    { name:"Bar Flores", type:"drinks", address:"1541 Echo Park Ave, Los Angeles, CA 90026", phone:"(213) 291-8781", linkText:"Website", linkUrl:"https://www.barflores.com/", vibe:"Colorful Echo Park cocktail bar", pace:"high", budget:"$$" },
    { name:"Guisados", type:"dinner", address:"2100 E Cesar E Chavez Ave, Los Angeles, CA 90033", phone:"(323) 264-7201", linkText:"Website", linkUrl:"https://guisados.co/", vibe:"Beloved handmade braised-taco counter", pace:"high", budget:"$" },
    { name:"Jon & Vinny's", type:"dinner", address:"412 N Fairfax Ave, Los Angeles, CA 90036", phone:"(323) 334-3369", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Buzzy Italian-American comfort spot", pace:"high", budget:"$$" },
    { name:"Salt & Straw (Larchmont)", type:"dessert", address:"240 N Larchmont Blvd, Los Angeles, CA 90004", phone:"(323) 466-0485", linkText:"Website", linkUrl:"https://saltandstraw.com/", vibe:"Inventive small-batch ice cream", pace:"chill", budget:"$" },
    { name:"Afternoon Tea at The Peninsula", type:"dessert", address:"9882 S Santa Monica Blvd, Beverly Hills, CA 90212", phone:"(310) 551-2888", linkText:"Website", linkUrl:"https://www.peninsula.com/", vibe:"Refined Beverly Hills afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "chicago": { name:"Chicago, IL", state:"IL", venues:[
    { name:"The Violet Hour", type:"drinks", address:"1520 N Damen Ave, Chicago, IL 60622", phone:"(773) 252-1500", linkText:"Website", linkUrl:"https://theviolethour.com", vibe:"Hidden clandestine craft cocktail lounge", pace:"chill", budget:"$$$" },
    { name:"Three Dots and a Dash", type:"drinks", address:"435 N Clark St, Chicago, IL 60654", phone:"(312) 610-4220", linkText:"Tock", linkUrl:"https://www.tock.com", vibe:"Immersive subterranean hidden tiki escape", pace:"high", budget:"$$$" },
    { name:"Bavette's Bar & Boeuf", type:"dinner", address:"217 W Kinzie St, Chicago, IL 60654", phone:"(312) 624-8154", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Dark, sultry, jazz-filled French steakhouse", pace:"chill", budget:"$$$$" },
    { name:"Girl & the Goat", type:"dinner", address:"809 W Randolph St, Chicago, IL 60607", phone:"(312) 492-6262", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Bustling, innovative West Loop hotspot", pace:"high", budget:"$$$" },
    { name:"Margie's Candies", type:"dessert", address:"1960 N Western Ave, Chicago, IL 60647", phone:"(773) 384-1035", linkText:"Website", linkUrl:"https://margiesfinecandies.com", vibe:"Cozy vintage ice cream and dessert parlor", pace:"chill", budget:"$" },
    { name:"Old Town Ale House", type:"drinks", address:"219 W North Ave, Chicago, IL 60610", phone:"(312) 944-7020", linkText:"Website", linkUrl:"http://theoldtownalehouse.com/", vibe:"Iconic gritty late-night dive bar", pace:"chill", budget:"$" },
    { name:"Lost Lake", type:"drinks", address:"3154 W Diversey Ave, Chicago, IL 60647", phone:"(773) 293-6048", linkText:"Website", linkUrl:"https://www.lostlaketiki.com/", vibe:"Vibrant award-winning tiki bar", pace:"high", budget:"$$" },
    { name:"The Aviary", type:"drinks", address:"955 W Fulton Market, Chicago, IL 60607", phone:"(312) 226-0868", linkText:"Tock", linkUrl:"https://www.tock.com", vibe:"Avant-garde cocktail tasting experience", pace:"chill", budget:"$$$$" },
    { name:"Lou Malnati's Pizzeria", type:"dinner", address:"439 N Wells St, Chicago, IL 60654", phone:"(312) 828-9800", linkText:"Website", linkUrl:"https://www.loumalnatis.com/", vibe:"Classic bustling deep-dish institution", pace:"high", budget:"$" },
    { name:"The Purple Pig", type:"dinner", address:"444 N Michigan Ave, Chicago, IL 60611", phone:"(312) 464-1744", linkText:"Website", linkUrl:"https://thepurplepigchicago.com/", vibe:"Bustling Mediterranean small plates", pace:"high", budget:"$$" },
    { name:"Mindy's Bakery", type:"dessert", address:"1623 N Milwaukee Ave, Chicago, IL 60647", phone:"(773) 342-4900", linkText:"Website", linkUrl:"https://mindysbakery.com/", vibe:"Pastry-chef bakery with playful sweets", pace:"chill", budget:"$$" },
    { name:"Palm Court at The Drake", type:"dessert", address:"140 E Walton Pl, Chicago, IL 60611", phone:"(312) 787-2200", linkText:"Website", linkUrl:"https://www.thedrakehotel.com/", vibe:"Historic elegant afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "miami": { name:"Miami, FL", state:"FL", venues:[
    { name:"Mila Lounge", type:"drinks", address:"1636 Meridian Ave, Miami Beach, FL 33139", phone:"(786) 706-0740", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Ultra-luxurious rooftop lounge with Mediterranean flair", pace:"high", budget:"$$$$" },
    { name:"The Broken Shaker", type:"drinks", address:"2727 Indian Creek Dr, Miami Beach, FL 33140", phone:"(305) 531-2727", linkText:"Website", linkUrl:"https://freehandhotels.com", vibe:"Handcrafted backyard oasis cocktail lounge", pace:"chill", budget:"$$$" },
    { name:"Carbone Miami", type:"dinner", address:"401 Collins Ave, Miami Beach, FL 33139", phone:"(305) 534-2423", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Theatrical, high-end retro Italian-American glamour", pace:"high", budget:"$$$$" },
    { name:"Komodo", type:"dinner", address:"801 Brickell Ave, Miami, FL 33131", phone:"(305) 534-2211", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"High-energy Southeast Asian hot spot with birdnest seating", pace:"high", budget:"$$$$" },
    { name:"Azucar Ice Cream Company", type:"dessert", address:"1503 SW 8th St, Miami, FL 33135", phone:"(305) 381-0369", linkText:"Website", linkUrl:"https://azucaricecream.com", vibe:"Vibrant artisanal ice cream shop in Little Havana", pace:"chill", budget:"$" },
    { name:"Mac's Club Deuce", type:"drinks", address:"222 14th St, Miami Beach, FL 33139", phone:"(305) 531-6200", linkText:"Website", linkUrl:"https://macsclubdeuce.com/", vibe:"Iconic no-frills South Beach dive", pace:"chill", budget:"$" },
    { name:"Lagniappe", type:"drinks", address:"3425 NE 2nd Ave, Miami, FL 33137", phone:"(305) 576-0108", linkText:"Website", linkUrl:"https://lagniappehouse.com/", vibe:"Wine-and-vinyl backyard garden bar", pace:"chill", budget:"$$" },
    { name:"Enriqueta's Sandwich Shop", type:"dinner", address:"186 NE 29th St, Miami, FL 33137", phone:"(305) 573-4681", linkText:"Website", linkUrl:"https://www.enriquetas.com/", vibe:"Beloved bustling Cuban lunch counter", pace:"high", budget:"$" },
    { name:"Coyo Taco", type:"dinner", address:"2300 NW 2nd Ave, Miami, FL 33127", phone:"(305) 573-8228", linkText:"Website", linkUrl:"https://coyo-taco.com/", vibe:"Buzzy Wynwood taqueria with a hidden bar", pace:"high", budget:"$$" },
    { name:"Fireman Derek's Bake Shop", type:"dessert", address:"2818 N Miami Ave, Miami, FL 33127", phone:"(786) 703-3623", linkText:"Website", linkUrl:"https://firemandereks.com/", vibe:"Famed pie and cake window in Wynwood", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Biltmore", type:"dessert", address:"1200 Anastasia Ave, Coral Gables, FL 33134", phone:"(855) 311-6903", linkText:"Website", linkUrl:"https://www.biltmorehotel.com/", vibe:"Grand historic-hotel afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "atlanta": { name:"Atlanta, GA", state:"GA", venues:[
    { name:"SkyLounge at Glenn Hotel", type:"drinks", address:"110 Marietta St NW, Atlanta, GA 30303", phone:"(404) 521-2250", linkText:"Website", linkUrl:"https://glennhotel.com", vibe:"Swanky rooftop lounge overlooking downtown", pace:"chill", budget:"$$$" },
    { name:"Regent Cocktail Club", type:"drinks", address:"3742 Peachtree Rd NE, Atlanta, GA 30319", phone:"(404) 775-4300", linkText:"Website", linkUrl:"https://buckheadvillage.com", vibe:"Intimate rooftop garden cocktail vibe", pace:"high", budget:"$$$" },
    { name:"St. Cecilia", type:"dinner", address:"3455 Peachtree Rd NE, Atlanta, GA 30326", phone:"(404) 554-9995", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Airy, coastal European elegance in Buckhead", pace:"chill", budget:"$$$$" },
    { name:"Miller Union", type:"dinner", address:"999 Brady Ave NW, Atlanta, GA 30318", phone:"(404) 352-9969", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Acclaimed farm-to-table southern dining room", pace:"chill", budget:"$$$" },
    { name:"Jeni's Splendid Ice Creams", type:"dessert", address:"1198 Howell Mill Rd, Atlanta, GA 30318", phone:"(404) 355-6050", linkText:"Website", linkUrl:"https://jenis.com", vibe:"Boutique artisan ice cream parlor", pace:"chill", budget:"$" },
    { name:"Manuel's Tavern", type:"drinks", address:"602 N Highland Ave NE, Atlanta, GA 30307", phone:"(404) 525-3447", linkText:"Website", linkUrl:"https://manuelstavern.com/", vibe:"Beloved wood-paneled neighborhood tavern", pace:"chill", budget:"$" },
    { name:"Ticonderoga Club", type:"drinks", address:"99 Krog St NE, Atlanta, GA 30307", phone:"(404) 458-4534", linkText:"Website", linkUrl:"https://www.ticonderogaclub.com/", vibe:"Nautical award-winning craft cocktail bar", pace:"high", budget:"$$" },
    { name:"Himitsu", type:"drinks", address:"3050 Peachtree Rd NW, Atlanta, GA 30305", phone:"(404) 800-8559", linkText:"Website", linkUrl:"https://www.himitsuatl.com/", vibe:"Intimate upscale Buckhead cocktail den", pace:"chill", budget:"$$$$" },
    { name:"Fox Bros. Bar-B-Q", type:"dinner", address:"1238 DeKalb Ave NE, Atlanta, GA 30307", phone:"(404) 577-4030", linkText:"Website", linkUrl:"https://foxbrosbbq.com/", vibe:"Acclaimed Texas-style barbecue joint", pace:"high", budget:"$" },
    { name:"Antico Pizza Napoletana", type:"dinner", address:"1093 Hemphill Ave NW, Atlanta, GA 30318", phone:"(404) 724-2333", linkText:"Website", linkUrl:"https://www.anticopizza.com/", vibe:"Bustling communal Neapolitan pizza hall", pace:"high", budget:"$$" },
    { name:"Little Tart Bakeshop", type:"dessert", address:"1186 N Highland Ave NE, Atlanta, GA 30306", phone:"(404) 806-0301", linkText:"Website", linkUrl:"https://www.littletartatl.com/", vibe:"Charming French-style bakeshop", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The St. Regis Atlanta", type:"dessert", address:"88 W Paces Ferry Rd NW, Atlanta, GA 30305", phone:"(404) 563-7900", linkText:"Website", linkUrl:"https://www.marriott.com/", vibe:"Refined afternoon tea in the Astor Court", pace:"chill", budget:"$$$" }
  ]},
  "boston": { name:"Boston, MA", state:"MA", venues:[
    { name:"Yvonne's", type:"drinks", address:"2 Winter Pl, Boston, MA 02108", phone:"(617) 267-0047", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Glamorous supper-club lounge with a hidden entrance", pace:"high", budget:"$$$" },
    { name:"Drink", type:"drinks", address:"348 Congress St, Boston, MA 02210", phone:"(617) 695-1806", linkText:"Website", linkUrl:"https://drinkfortpoint.com", vibe:"Intimate Fort Point cocktail den with no menu", pace:"chill", budget:"$$$" },
    { name:"Grill 23 & Bar", type:"dinner", address:"161 Berkeley St, Boston, MA 02116", phone:"(617) 542-2255", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Clubby, classic power steakhouse", pace:"chill", budget:"$$$$" },
    { name:"SRV", type:"dinner", address:"569 Columbus Ave, Boston, MA 02118", phone:"(617) 536-9500", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Lively Venetian bacaro with cicchetti and spritzes", pace:"high", budget:"$$$" },
    { name:"Mike's Pastry", type:"dessert", address:"300 Hanover St, Boston, MA 02113", phone:"(617) 742-3050", linkText:"Website", linkUrl:"https://mikespastry.com", vibe:"Iconic bustling North End cannoli counter", pace:"high", budget:"$" },
    { name:"The Sevens Ale House", type:"drinks", address:"77 Charles St, Boston, MA 02114", phone:"(617) 523-9074", linkText:"Website", linkUrl:"https://sevensalehouse.com/", vibe:"Cozy Beacon Hill neighborhood pub", pace:"chill", budget:"$" },
    { name:"Wink & Nod", type:"drinks", address:"3 Appleton St, Boston, MA 02116", phone:"(617) 482-0117", linkText:"Website", linkUrl:"https://www.winkandnod.com/", vibe:"Speakeasy-style South End cocktail den", pace:"high", budget:"$$" },
    { name:"OAK Long Bar", type:"drinks", address:"138 St James Ave, Boston, MA 02116", phone:"(617) 585-7222", linkText:"Website", linkUrl:"https://www.oaklongbarkitchen.com/", vibe:"Grand Copley Square hotel bar", pace:"chill", budget:"$$$$" },
    { name:"Regina Pizzeria", type:"dinner", address:"11 1/2 Thacher St, Boston, MA 02113", phone:"(617) 227-0765", linkText:"Website", linkUrl:"https://www.reginapizzeria.com/", vibe:"Historic bustling North End brick-oven pizza", pace:"high", budget:"$" },
    { name:"Coppa Enoteca", type:"dinner", address:"253 Shawmut Ave, Boston, MA 02118", phone:"(617) 391-0902", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Snug South End Italian enoteca", pace:"high", budget:"$$" },
    { name:"Flour Bakery + Cafe", type:"dessert", address:"1595 Washington St, Boston, MA 02118", phone:"(617) 267-4300", linkText:"Website", linkUrl:"https://flourbakery.com/", vibe:"Beloved bakery famed for sticky buns", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Bristol", type:"dessert", address:"200 Boylston St, Boston, MA 02116", phone:"(617) 351-2037", linkText:"Website", linkUrl:"https://www.fourseasons.com/boston/", vibe:"Refined Four Seasons afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "san-francisco": { name:"San Francisco, CA", state:"CA", venues:[
    { name:"Bourbon & Branch", type:"drinks", address:"501 Jones St, San Francisco, CA 94102", phone:"(415) 346-1735", linkText:"Website", linkUrl:"https://bourbonandbranch.com", vibe:"Password-entry Prohibition-era speakeasy", pace:"chill", budget:"$$$" },
    { name:"Trick Dog", type:"drinks", address:"3010 20th St, San Francisco, CA 94110", phone:"(415) 471-2999", linkText:"Website", linkUrl:"https://trickdogbar.com", vibe:"Buzzy Mission bar with themed cocktail menus", pace:"high", budget:"$$$" },
    { name:"Gary Danko", type:"dinner", address:"800 North Point St, San Francisco, CA 94109", phone:"(415) 749-2060", linkText:"Website", linkUrl:"https://garydanko.com", vibe:"Refined, formal tasting-menu institution", pace:"chill", budget:"$$$$" },
    { name:"Nopa", type:"dinner", address:"560 Divisadero St, San Francisco, CA 94117", phone:"(415) 864-8643", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Energetic organic California kitchen open late", pace:"high", budget:"$$$" },
    { name:"Bi-Rite Creamery", type:"dessert", address:"3692 18th St, San Francisco, CA 94110", phone:"(415) 626-5600", linkText:"Website", linkUrl:"https://biritecreamery.com", vibe:"Beloved organic ice cream scoop shop", pace:"chill", budget:"$" },
    { name:"Specs' Twelve Adler Museum Cafe", type:"drinks", address:"12 William Saroyan Pl, San Francisco, CA 94133", phone:"(415) 421-4112", linkText:"Website", linkUrl:"https://www.yelp.com/biz/specs-twelve-adler-museum-cafe-san-francisco", vibe:"Cluttered, characterful North Beach dive", pace:"chill", budget:"$" },
    { name:"Zombie Village", type:"drinks", address:"441 Jones St, San Francisco, CA 94102", phone:"(415) 359-1359", linkText:"Website", linkUrl:"https://www.zombievillagebar.com/", vibe:"Immersive multi-room tiki fantasy bar", pace:"high", budget:"$$" },
    { name:"Big 4 Restaurant", type:"drinks", address:"1075 California St, San Francisco, CA 94108", phone:"(415) 771-1140", linkText:"Website", linkUrl:"https://www.big4restaurant.com/", vibe:"Clubby Nob Hill lounge with live piano", pace:"chill", budget:"$$$$" },
    { name:"Tony's Pizza Napoletana", type:"dinner", address:"1570 Stockton St, San Francisco, CA 94133", phone:"(415) 835-9888", linkText:"Website", linkUrl:"https://tonyspizzanapoletana.com/", vibe:"Bustling award-winning North Beach pizzeria", pace:"high", budget:"$" },
    { name:"Flour + Water", type:"dinner", address:"2401 Harrison St, San Francisco, CA 94110", phone:"(415) 826-7000", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Buzzy Mission pasta destination", pace:"high", budget:"$$" },
    { name:"b. patisserie", type:"dessert", address:"2821 California St, San Francisco, CA 94115", phone:"(415) 440-1700", linkText:"Website", linkUrl:"https://bpatisserie.com/", vibe:"Acclaimed French patisserie for kouign-amann", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Palace", type:"dessert", address:"2 New Montgomery St, San Francisco, CA 94105", phone:"(415) 512-1111", linkText:"Website", linkUrl:"https://www.marriott.com/", vibe:"Grand Garden Court afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "austin": { name:"Austin, TX", state:"TX", venues:[
    { name:"The Roosevelt Room", type:"drinks", address:"307 W 5th St, Austin, TX 78701", phone:"(512) 494-4094", linkText:"Website", linkUrl:"https://therooseveltroomatx.com", vibe:"Award-winning downtown craft cocktail bar", pace:"chill", budget:"$$$" },
    { name:"Whisler's", type:"drinks", address:"1816 E 6th St, Austin, TX 78702", phone:"(512) 480-0781", linkText:"Website", linkUrl:"https://whislersatx.com", vibe:"Eclectic East Side bar with a mezcal loft", pace:"high", budget:"$$" },
    { name:"Uchi Austin", type:"dinner", address:"801 S Lamar Blvd, Austin, TX 78704", phone:"(512) 916-4808", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Refined, inventive contemporary Japanese", pace:"chill", budget:"$$$$" },
    { name:"Odd Duck", type:"dinner", address:"1201 S Lamar Blvd, Austin, TX 78704", phone:"(512) 433-6521", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Lively farm-to-table small plates", pace:"high", budget:"$$$" },
    { name:"Amy's Ice Creams (South Congress)", type:"dessert", address:"1301 S Congress Ave, Austin, TX 78704", phone:"(512) 440-7488", linkText:"Website", linkUrl:"https://amysicecreams.com", vibe:"Austin institution with crush'd mix-ins", pace:"high", budget:"$" },
    { name:"The White Horse", type:"drinks", address:"500 Comal St, Austin, TX 78702", phone:"(512) 553-6756", linkText:"Website", linkUrl:"https://www.thewhitehorseaustin.com/", vibe:"Rowdy honky-tonk with two-stepping", pace:"high", budget:"$" },
    { name:"Garrison", type:"drinks", address:"200 Congress Ave, Austin, TX 78701", phone:"(512) 596-1699", linkText:"Website", linkUrl:"https://www.fourseasons.com/austin/", vibe:"Polished Four Seasons cocktail bar", pace:"chill", budget:"$$$$" },
    { name:"Franklin Barbecue", type:"dinner", address:"900 E 11th St, Austin, TX 78702", phone:"(512) 653-1187", linkText:"Website", linkUrl:"https://franklinbbq.com/", vibe:"World-famous brisket worth the line", pace:"high", budget:"$" },
    { name:"Comedor", type:"dinner", address:"501 Colorado St, Austin, TX 78701", phone:"(512) 499-0977", linkText:"Resy", linkUrl:"https://resy.com", vibe:"Sleek modern Mexican downtown", pace:"high", budget:"$$" },
    { name:"Quack's 43rd Street Bakery", type:"dessert", address:"411 E 43rd St, Austin, TX 78751", phone:"(512) 453-3399", linkText:"Website", linkUrl:"https://www.quacksbakery.com/", vibe:"Hyde Park neighborhood cake-and-cookie bakery", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Driskill", type:"dessert", address:"604 Brazos St, Austin, TX 78701", phone:"(512) 439-1234", linkText:"Website", linkUrl:"https://www.driskillhotel.com/", vibe:"Grand historic-hotel afternoon tea", pace:"chill", budget:"$$$" }
  ]},
  "dallas-ft-worth": { name:"Dallas–Fort Worth, TX", state:"TX", venues:[
    { name:"Happiest Hour", type:"drinks", address:"2616 Olive St, Dallas, TX 75201", phone:"(972) 528-7288", linkText:"Website", linkUrl:"https://happiesthourdallas.com", vibe:"Vibrant expansive patio lounge with skyline views", pace:"high", budget:"$$" },
    { name:"Midnight Rambler", type:"drinks", address:"1530 Main St, Dallas, TX 75201", phone:"(214) 261-4631", linkText:"Website", linkUrl:"https://midnightramblerbar.com", vibe:"Subterranean designer cocktail salon", pace:"chill", budget:"$$$" },
    { name:"Monarch", type:"dinner", address:"1401 Elm St, Dallas, TX 75202", phone:"(214) 628-8351", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Stunning 49th-floor views with wood-fired Italian", pace:"high", budget:"$$$$" },
    { name:"Uchi Dallas", type:"dinner", address:"2817 Maple Ave, Dallas, TX 75201", phone:"(214) 855-5454", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Sophisticated contemporary Japanese dining", pace:"chill", budget:"$$$$" },
    { name:"Emporium Pies", type:"dessert", address:"314 N Bishop Ave, Dallas, TX 75208", phone:"(214) 941-5948", linkText:"Website", linkUrl:"https://emporiumpies.com", vibe:"Artisanal boutique pie shop", pace:"chill", budget:"$" },
    { name:"Lakewood Landing", type:"drinks", address:"5818 Live Oak St, Dallas, TX 75214", phone:"(214) 823-2410", linkText:"Website", linkUrl:"https://www.lakewoodlanding.com/", vibe:"Beloved retro neighborhood dive bar", pace:"chill", budget:"$" },
    { name:"The Mansion Bar", type:"drinks", address:"2821 Turtle Creek Blvd, Dallas, TX 75219", phone:"(214) 559-2100", linkText:"Website", linkUrl:"https://www.rosewoodhotels.com/", vibe:"Opulent Turtle Creek hotel cocktail lounge", pace:"chill", budget:"$$$$" },
    { name:"Pecan Lodge", type:"dinner", address:"2702 Main St, Dallas, TX 75226", phone:"(214) 748-8900", linkText:"Website", linkUrl:"https://pecanlodge.com/", vibe:"Famed Deep Ellum Texas BBQ counter", pace:"high", budget:"$" },
    { name:"Rise Nº 1", type:"dinner", address:"5360 W Lovers Ln #220, Dallas, TX 75209", phone:"(214) 366-9900", linkText:"OpenTable", linkUrl:"https://www.opentable.com", vibe:"Cozy French soufflé bistro", pace:"chill", budget:"$$" },
    { name:"Bisous Bisous Patisserie", type:"dessert", address:"3700 McKinney Ave #124, Dallas, TX 75204", phone:"(214) 216-1200", linkText:"Website", linkUrl:"https://bisousbisouspatisserie.com/", vibe:"Delicate French patisserie", pace:"chill", budget:"$$" },
    { name:"Afternoon Tea at The Adolphus", type:"dessert", address:"1321 Commerce St, Dallas, TX 75202", phone:"(214) 742-8200", linkText:"Website", linkUrl:"https://www.theadolphus.com/", vibe:"Historic grand-hotel high tea", pace:"chill", budget:"$$$" }
  ]}
};
