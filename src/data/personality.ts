// Ported directly from the live makeherswoon.com production data:
// the 20-question personality quiz, intake steps, mood picker, and type profiles.
import { METROS } from './metros';

export interface QuizOption {
  key: string;
  label: string;
  desc?: string;
  emoji?: string;
  gradient?: string;
  axis?: string;
  letter?: string;
}

export interface QuizStep {
  id: string;
  phase: 'intake' | 'personality';
  type: 'choice' | 'text';
  axis?: string;
  title: string;
  subtitle?: string;
  cols?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  multiSelect?: boolean;
  maxSelect?: number;
  placeholder?: string;
  options?: QuizOption[];
}

export const introSteps: QuizStep[] = [
  {id:"city",phase:"intake",type:"choice",cols:2,searchable:true,searchPlaceholder:"Search your city or state…",title:"Where's the Date?",subtitle:"We'll match every stop to real venues across the top 50 U.S. metros.",options:Object.keys(METROS).map(k=>({key:k,label:METROS[k].name,desc:METROS[k].state}))},
  {id:"budget",phase:"intake",type:"choice",cols:4,title:"What's the Budget?",subtitle:"Set the range and every suggestion will fit it.",options:[{key:"$",label:"$",desc:"Keep it simple"},{key:"$$",label:"$$",desc:"A solid night out"},{key:"$$$",label:"$$$",desc:"Something special"},{key:"$$$$",label:"$$$$",desc:"Go all out"}]},
  {id:"occasion",phase:"intake",type:"choice",cols:2,title:"What's the Occasion?",subtitle:"Tell us what we're planning around.",options:[{key:"first-date",label:"First Date",desc:"Making a strong first impression"},{key:"holiday",label:"A Specific Holiday",desc:"Valentine's Day, her birthday, an anniversary"}]},
  {id:"relationship",phase:"intake",type:"choice",cols:3,title:"Where Are You Two?",subtitle:"This shapes the whole tone of the plan.",options:[{key:"first-date",label:"1st Date",desc:"Just getting started"},{key:"date-2-4",label:"Date 2–4",desc:"Building momentum"},{key:"date-5-plus",label:"Date 5+",desc:"Getting comfortable"},{key:"committed",label:"Committed",desc:"Exclusive and official"},{key:"engaged",label:"Engaged",desc:"Planning a life together"},{key:"married",label:"Married",desc:"In it for the long haul"}]},
  {id:"confidence",phase:"intake",type:"choice",cols:2,title:"How Into You Is She?",subtitle:"Be honest — it changes the strategy.",options:[{key:"unsure",label:"Still Figuring It Out",desc:"Reading the signals"},{key:"into-it",label:"She's Into It",desc:"Good energy so far"},{key:"smitten",label:"She's Smitten",desc:"Clearly into you"},{key:"all-in",label:"She's All In",desc:"Fully locked in"}]}
];

export const holidayStep: QuizStep = {id:"holidayName",phase:"intake",type:"text",title:"Which Holiday (or Occasion)?",subtitle:"e.g. Valentine's Day, her birthday, your anniversary",placeholder:"Type it here..."};

export const TONIGHT_MOODS: QuizOption[] = [
  {key:"outdoor-active",label:"Outdoor & Active",desc:"Fresh air, movement, on your feet",emoji:"🌲",gradient:"from-emerald-400 to-teal-500",axis:"AR",letter:"A"},
  {key:"relaxed-easy",label:"Relaxed & Easy",desc:"Slow pace, zero rush",emoji:"🛋️",gradient:"from-amber-300 to-orange-400",axis:"AR",letter:"R"},
  {key:"social-lively",label:"Social & Lively",desc:"Energy, people, a scene",emoji:"🎉",gradient:"from-pink-400 to-rose-500",axis:"SI",letter:"S"},
  {key:"intimate-close",label:"Intimate & Close",desc:"Just the two of you, quiet and close",emoji:"🕯️",gradient:"from-indigo-400 to-purple-500",axis:"SI",letter:"I"},
  {key:"artsy-creative",label:"Artsy & Creative",desc:"Something fresh, creative, of-the-moment",emoji:"🎨",gradient:"from-sky-400 to-blue-500",axis:"CT",letter:"T"},
  {key:"classic-timeless",label:"Classic & Timeless",desc:"A tried-and-true favorite",emoji:"🕰️",gradient:"from-stone-400 to-neutral-500",axis:"CT",letter:"C"}
];

export const dateMoodStep: QuizStep = {id:"dateMood",phase:"intake",type:"choice",multiSelect:true,maxSelect:2,cols:3,title:"What Do You Want Tonight to Be?",subtitle:"Pick 1 or 2. We already know her personality — this is about tonight's vibe.",options:TONIGHT_MOODS};

export const personalityQuestions: QuizStep[] = [
  {id:"q1",phase:"personality",type:"choice",axis:"AR",title:"Her ideal Saturday involves...",options:[{key:"A",label:"Trying something she's never done before"},{key:"R",label:"A slow morning and zero plans"}]},
  {id:"q9",phase:"personality",type:"choice",axis:"SI",title:"At a party, she's usually...",options:[{key:"S",label:"Working the whole room"},{key:"I",label:"Deep in one good conversation"}]},
  {id:"q17",phase:"personality",type:"choice",axis:"CT",title:"Her taste in restaurants leans...",options:[{key:"C",label:"Timeless spots with a track record"},{key:"T",label:"Whatever's new and buzzy right now"}]},
  {id:"q24",phase:"personality",type:"choice",axis:"PF",title:"Her calendar is usually...",options:[{key:"P",label:"Color-coded and full of plans"},{key:"F",label:"Loose — she figures it out as she goes"}]},
  {id:"q2",phase:"personality",type:"choice",axis:"AR",title:"When picking a vacation, she leans toward...",options:[{key:"A",label:"Somewhere unpredictable and off the map"},{key:"R",label:"Somewhere she can fully relax"}]},
  {id:"q13",phase:"personality",type:"choice",axis:"SI",title:"On her birthday, she'd want...",options:[{key:"S",label:"A night out with everyone she knows"},{key:"I",label:"A quiet dinner with just you"}]},
  {id:"q19",phase:"personality",type:"choice",axis:"CT",title:"She'd rather listen to...",options:[{key:"C",label:"Songs she's loved for years"},{key:"T",label:"This week's new releases"}]},
  {id:"q26",phase:"personality",type:"choice",axis:"PF",title:"She'd rather you...",options:[{key:"P",label:"Tell her the plan ahead of time"},{key:"F",label:"Surprise her with no warning"}]},
  {id:"q4",phase:"personality",type:"choice",axis:"AR",title:"Surprise tickets to something tonight, and she'd...",options:[{key:"A",label:"Already be grabbing her shoes"},{key:"R",label:"Ask what it is first"}]},
  {id:"q15",phase:"personality",type:"choice",axis:"SI",title:"Her ideal date has...",options:[{key:"S",label:"Energy, people-watching, a scene"},{key:"I",label:"Just the two of you, no distractions"}]},
  {id:"q21",phase:"personality",type:"choice",axis:"CT",title:"For a gift, she'd rather receive...",options:[{key:"C",label:"Something sentimental and traditional"},{key:"T",label:"Something new and of-the-moment"}]},
  {id:"q30",phase:"personality",type:"choice",axis:"PF",title:"Her ideal big romantic moment would be...",options:[{key:"P",label:"Thoughtfully planned down to the details"},{key:"F",label:"Spontaneous and in the moment"}]},
  {id:"q6",phase:"personality",type:"choice",axis:"AR",title:"On a road trip, she'd rather...",options:[{key:"A",label:"Take the scenic detour"},{key:"R",label:"Stick to the route and get there"}]},
  {id:"q16",phase:"personality",type:"choice",axis:"SI",title:"She'd rather spend Friday night...",options:[{key:"S",label:"Out at a busy bar or event"},{key:"I",label:"In, with good food and good company"}]},
  {id:"q22",phase:"personality",type:"choice",axis:"CT",title:"Her ideal night out is somewhere...",options:[{key:"C",label:"That's been a favorite for years"},{key:"T",label:"That just opened and everyone's talking about"}]}
];

export const TYPE_PROFILES: Record<string, {name: string; blurb: string}> = {
  ASCP:{name:"The Adventure Host",blurb:"Loves trying new things surrounded by people, but still wants the classics done right — and she likes knowing the plan."},
  ASCF:{name:"The Free-Spirited Adventurer",blurb:"Adventurous and social with timeless taste, but hates being boxed into a schedule. Keep it lively and leave room to improvise."},
  ASTP:{name:"The Scene Setter",blurb:"She wants to be out, seen, and somewhere buzzworthy — and she likes a plan. Bring energy, bring trend, keep the structure tight."},
  ASTF:{name:"The Wildcard",blurb:"Social, trend-chasing, and totally unpredictable. She wants energy and newness with zero rigid plans."},
  AICP:{name:"The Quiet Explorer",blurb:"Adventurous, but not for a crowd. She wants new experiences one-on-one, with classic taste, and appreciates a plan."},
  AICF:{name:"The Free-Range Romantic",blurb:"She craves adventure in intimate settings with timeless taste — no schedule required. Surprise her."},
  AITP:{name:"The Curated Adventurer",blurb:"She wants new, one-on-one experiences with a trendy edge, and she likes knowing what's coming."},
  AITF:{name:"The Untamed Aesthete",blurb:"Adventurous, private, drawn to what's new, and totally spontaneous. Surprise her with something nobody's done yet."},
  RSCP:{name:"The Classic Socialite",blurb:"Relaxed but loves being around people, sticks to timeless favorites, and likes a plan. No surprises needed."},
  RSCF:{name:"The Easy Company",blurb:"Laid-back, social, classic taste, happy to go with the flow. Low-key hangouts at familiar places work best."},
  RSTP:{name:"The Curated Crowd-Pleaser",blurb:"Relaxed but social, drawn to what's new, and appreciates structure. Bring her somewhere fresh with a plan already set."},
  RSTF:{name:"The Effortless It-Girl",blurb:"Laid-back, social, trend-aware, and spontaneous. She wants wherever's buzzing right now."},
  RICP:{name:"The Cozy Traditionalist",blurb:"Relaxed, private, classic, and likes a plan. A quiet dinner at a beloved spot, decided in advance."},
  RICF:{name:"The Slow Romantic",blurb:"Relaxed, intimate, classic, and totally unbothered by planning. A slow, unstructured evening together."},
  RITP:{name:"The Aesthetic Homebody",blurb:"Relaxed and private, but drawn to what's new and trendy, with a preference for a plan."},
  RITF:{name:"The Dreamy Wanderer",blurb:"Relaxed, intimate, trend-drawn, and completely spontaneous. Let the evening unfold somewhere new."}
};

export const PRICE_IDS: Record<string, string> = {
  starter: 'price_1TxW4IPq6YIfTGHv4zXkMX9E',
  operator: 'price_1TxW4gPq6YIfTGHv0hK6wl60',
  command: 'price_1TxW51Pq6YIfTGHvlEFMlgsH',
};

export const STOP_LABELS: string[] = ["Stop 1 // Arrival & Drinks","Stop 2 // The Main Event","Stop 3 // The Nightcap"];
