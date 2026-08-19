export type ClusterId =
  | 'store'
  | 'clocks'
  | 'data'
  | 'pointer'
  | 'intent'
  | 'camera'
  | 'derived'
  | 'share'
  | 'haunt';

export type DrinkKind = 'coffee' | 'tea' | 'pastry';

export interface Cluster {
  id: ClusterId;
  label: string;
  blurb: string;
}

export type LessonBlock =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'pre'; lines: string }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'hr' }
  | { type: 'kid'; text?: string; items?: string[] }
  | { type: 'callout'; lines: string[] };

export interface LessonSection {
  heading: string;
  blocks?: LessonBlock[];
}

export interface TopicNode {
  id: string;
  n: number;
  title: string;
  label: string;
  cluster: ClusterId;
  gist: string;
  remember: string[];
  sections?: LessonSection[];
}

export interface Drink {
  id: string;
  name: string;
  kind: DrinkKind;
  cups: number;
}

export const KIND_LABEL: Record<DrinkKind, string> = {
  coffee: 'Coffee',
  tea: 'Tea',
  pastry: 'Pastry',
};

export const drinks: Drink[] = [
  { id: 'espresso', name: 'Espresso', kind: 'coffee', cups: 42 },
  { id: 'latte', name: 'Latte', kind: 'coffee', cups: 67 },
  { id: 'mocha', name: 'Mocha', kind: 'coffee', cups: 31 },
  { id: 'cold-brew', name: 'Cold brew', kind: 'coffee', cups: 48 },
  { id: 'matcha', name: 'Matcha', kind: 'tea', cups: 39 },
  { id: 'jasmine', name: 'Jasmine tea', kind: 'tea', cups: 22 },
  { id: 'iced-tea', name: 'Iced tea', kind: 'tea', cups: 28 },
  { id: 'croissant', name: 'Croissant', kind: 'pastry', cups: 51 },
  { id: 'cookie', name: 'Cookie', kind: 'pastry', cups: 44 },
  { id: 'muffin', name: 'Muffin', kind: 'pastry', cups: 19 },
];

export const clusters: Cluster[] = [
  {
    id: 'store',
    label: 'The store',
    blurb: 'One fact, many screens. If they do not share a number, they lie.',
  },
  {
    id: 'clocks',
    label: 'The clocks',
    blurb: 'A chart is not one state. It is several clocks on one picture.',
  },
  {
    id: 'data',
    label: 'Data',
    blurb: 'The toys in the box. Changes when the fetch changes — not when you point.',
  },
  {
    id: 'pointer',
    label: 'Pointer',
    blurb: 'Hover is pointing. It lives for milliseconds. The URL must never know.',
  },
  {
    id: 'intent',
    label: 'Intent',
    blurb: 'Selection and filter: what you decided to hold, and which toys you took out.',
  },
  {
    id: 'camera',
    label: 'Camera',
    blurb: 'Pan and zoom are walking closer. The drinks did not change.',
  },
  {
    id: 'derived',
    label: 'Derived',
    blurb: 'What is next to the one you are holding. Computed. Never stored.',
  },
  {
    id: 'share',
    label: 'Share',
    blurb: 'Only intent travels. Hover, camera, and derived stay on this machine.',
  },
  {
    id: 'haunt',
    label: 'The haunt',
    blurb: 'Bugs in viz are two clocks sharing one box.',
  },
];

export const topics: TopicNode[] = [
  {
    id: 'store',
    n: 1,
    title: 'Two copies, one fact',
    label: 'Start',
    cluster: 'store',
    gist: 'Start here. If two pieces of the screen show the same number, they must read it from one place. A café cart is the simple version of that idea.',
    remember: [
      'Without a store, the product card and the cart icon each keep their own count.',
      'With a store, both read the same number — they stay in sync.',
      'A chart is the next problem: several numbers on one picture, not one number on two screens.',
    ],
    sections: [
      {
        heading: '1. Try the café',
        blocks: [
          {
            type: 'p',
            text: 'Leave the left chart alone for this lesson. Use the café below. Click **Add latte** on **Without a store**. Watch the two counts. Then switch to **With a store** and do it again.',
          },
        ],
      },
      {
        heading: '2. What just happened',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Without a store** — the latte card adds 1. The cart icon never hears about it. Two copies of one fact.',
              '**With a store** — there is one count. Both the card and the icon read it. That shared box is what people mean by “state management” in a café.',
            ],
          },
          {
            type: 'quote',
            text: 'The café cart was one number and two readers. A chart is several numbers on one picture. Sharing a store does not tell you which number it is.',
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'Two kids each wrote “how many lattes” on their own paper. One sold a latte and updated their paper. The other paper still says the old number. Give them one shared paper instead.',
          },
        ],
      },
      {
        heading: '4. What to do next',
        blocks: [
          {
            type: 'callout',
            lines: [
              'Press **Next** at the bottom (or click lesson **2 · Clocks** under the chart).',
              'From there, the left side is the lesson — hover and click the bars, and watch the colored pills.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'clocks',
    n: 2,
    title: 'Several clocks, one picture',
    label: 'Clocks',
    cluster: 'clocks',
    gist: 'A visualization is not “the data plus some UI.” It is several kinds of truth stacked on one picture, each ticking at a different speed. Mixing the clocks is why the chart feels haunted.',
    remember: [
      'Data, hover, selection, filter, camera, derived, and URL are different clocks.',
      'If two clocks share one variable, the picture lies.',
      'The left chart is the lesson. Watch the HUD while you poke it.',
    ],
    sections: [
      {
        heading: '1. What you are looking at',
        blocks: [
          {
            type: 'p',
            text: 'You already did the café: one number, two readers. Now look left. The café chart is **several** kinds of truth stacked on one picture — data, hover, click, filter, zoom. Mixing those is why a chart feels haunted.',
          },
          {
            type: 'p',
            text: 'The colored pills above the bars are a HUD. They are not decoration. They are the clocks, named, with their current values. When a pill is empty, that clock is off or idle. When it lights up, that clock is ticking.',
          },
          {
            type: 'quote',
            text: 'If you can see the clocks, you already understand state management. The words just name what you saw.',
          },
        ],
      },
      {
        heading: '2. Why this is not a Redux post',
        blocks: [
          {
            type: 'p',
            text: 'Most “state management” writing is about libraries. Zustand, Pinia, Redux, Jotai. Those are drawers. This note is about **what belongs in which drawer** when the thing on screen is a picture that reacts.',
          },
          {
            type: 'ul',
            items: [
              'A form has one clock: the fields.',
              'A chart has five or six, all visible at once.',
              'The library does not save you if hover and selection share a variable.',
            ],
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            items: [
              'The drinks are toys in a box.',
              'Pointing at a toy is not picking it up.',
              'Walking closer is not changing which toys exist.',
              'If you write “I am pointing” on the same sticky note as “I am holding this,” the room gets haunted.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'data',
    n: 3,
    title: 'Data is the toys in the box',
    label: 'Data',
    cluster: 'data',
    gist: 'Data state is the dataset. It changes when the server says so — a refetch, a new day, a new CSV. Hovering a bar must not rewrite how many lattes were sold.',
    remember: [
      'Data is the source of truth for the picture, not for the interaction.',
      'Treat it as immutable from the chart’s point of view.',
      'The HUD row `data: 10 drinks` should not flicker when you move the mouse.',
    ],
    sections: [
      {
        heading: '1. Core idea',
        blocks: [
          {
            type: 'p',
            text: 'Turn the other layers off. You should see quiet bars. That is data: names, kinds, cups. No glow, no dimming, no camera. A chart that only has data is a printed poster.',
          },
          {
            type: 'pre',
            lines: `{ id: 'latte', name: 'Latte', kind: 'coffee', cups: 67 }`,
          },
          {
            type: 'p',
            text: 'Ten of those. The component does not “own” the cups. It *reads* them. If a bar looks taller because you hovered it, you have already mixed clocks.',
          },
        ],
      },
      {
        heading: '2. What data is not',
        blocks: [
          {
            type: 'table',
            columns: ['Looks like data', 'Actually'],
            rows: [
              ['Which bar is glowing', 'Hover'],
              ['Which bar stays on after click', 'Selection'],
              ['Coffee-only view', 'Filter'],
              ['Zoomed-in crop', 'Camera'],
              ['Other coffees lighting up', 'Derived'],
            ],
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'The box of toys does not change because you pointed at the red car. The box changes when someone puts a new toy in, or takes one out for real.',
          },
        ],
      },
    ],
  },
  {
    id: 'hover',
    n: 4,
    title: 'Hover is pointing',
    label: 'Hover',
    cluster: 'pointer',
    gist: 'Hover lives for milliseconds. It is a finger over a bar, not a decision. It must never hit the URL, never survive a re-render as “the selected thing,” never rewrite the data.',
    remember: [
      'Hover is ephemeral. Mouseleave should be able to clear it completely.',
      'The gold ring is pointing. The purple fill is holding. They are not the same.',
      'If hover writes into `selectedId`, every sweep of the mouse is a click. That is the haunt.',
    ],
    sections: [
      {
        heading: '1. Watch the HUD',
        blocks: [
          {
            type: 'p',
            text: 'Turn **Hover** on. Move across the bars. The gold ring follows. The HUD pill `hover:` should change every time. `selected:` should stay empty unless you click.',
          },
          {
            type: 'p',
            text: 'That split is the whole lesson. Two refs. Two clocks. One picture.',
          },
          {
            type: 'pre',
            lines: `hoverId    = 'latte'     // this frame only
selectedId = null        // you have not decided yet`,
          },
        ],
      },
      {
        heading: '2. Why people merge them',
        blocks: [
          {
            type: 'p',
            text: 'It is tempting: `activeId`. One variable for “the bar we care about.” Then tooltips, highlights, and detail panels all read `activeId`. Then a click and a hover fight, and a shared link opens on whatever the last mouse position was.',
          },
          {
            type: 'callout',
            lines: [
              '**Do not** store hover in the same box as selection.',
              'Tooltip reads `hoverId`. Detail panel reads `selectedId`.',
              'If you need “the thing under attention,” compute it: `hoverId ?? selectedId`. Derived. Not stored.',
            ],
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'Pointing at a cookie is not eating the cookie. If you write “pointing” on the lunch order, the kitchen gets confused.',
          },
        ],
      },
    ],
  },
  {
    id: 'select',
    n: 5,
    title: 'Selection is holding',
    label: 'Select',
    cluster: 'intent',
    gist: 'A click is a decision. Selection stays after the mouse leaves. It is intent: “this is the drink I am looking at.” Intent can live in the URL. Hover cannot.',
    remember: [
      'Click sets selection. Clicking the same bar can clear it.',
      'Selection survives mouseleave. Hover does not.',
      'A detail panel, a lesson, a hash — those read selection, not hover.',
    ],
    sections: [
      {
        heading: '1. Core idea',
        blocks: [
          {
            type: 'p',
            text: 'Turn **Hover** and **Select** on. Point at Latte — gold ring. Click — purple fill. Move away. The gold is gone. The purple stays. That is the difference between pointing and holding.',
          },
          {
            type: 'pre',
            lines: `function onClick(id) {
  selectedId = selectedId === id ? null : id
}

function onLeave() {
  hoverId = null
  // selectedId untouched
}`,
          },
        ],
      },
      {
        heading: '2. Selection is allowed to be empty',
        blocks: [
          {
            type: 'p',
            text: 'Empty selection is a real state. The empty lesson panel on this page is that idea. Do not invent a default “first bar” unless the product actually wants one. A default that you never chose is a lie about intent.',
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'Holding the red car means you picked it. Putting it back down is also a decision. Pointing at every car on the way to the door is not picking them all.',
          },
        ],
      },
    ],
  },
  {
    id: 'filter',
    n: 6,
    title: 'Filter is the box you opened',
    label: 'Filter',
    cluster: 'intent',
    gist: 'A filter hides what you are not asking about. The toys still exist in the box. The poster did not lose muffins — you just opened the pastry drawer, or you did not.',
    remember: [
      'Filter is intent, like selection — but it is about a *set*, not one item.',
      'Data still has ten drinks. The view may show three.',
      'If the selected bar is filtered out, selection became illegal. Decide: clear it, or keep it and show “hidden by filter.”',
    ],
    sections: [
      {
        heading: '1. Watch the bars dim',
        blocks: [
          {
            type: 'p',
            text: 'Turn **Filter** on. Click **Coffee**. Tea and pastry dim. The HUD says `filter: coffee`. The data pill still says `10 drinks`. That is the point: filter is a lens, not a delete.',
          },
          {
            type: 'p',
            text: 'Select Muffin, then filter Coffee. Muffin is still selected, but it is in the dark. The HUD warns. That warning is a design decision you cannot skip — mixed clocks produce illegal combinations.',
          },
        ],
      },
      {
        heading: '2. Two honest options',
        blocks: [
          {
            type: 'table',
            columns: ['When filter hides the selection', 'What you do'],
            rows: [
              ['Clear selection', 'Intent follows the lens. Honest, a little jumpy.'],
              ['Keep it, mark hidden', 'Intent survives. The picture must say so.'],
            ],
          },
          {
            type: 'p',
            text: 'What you must **not** do: leave a selected muffin driving a detail panel while the chart pretends only coffee exists, with no signal. That is two truths.',
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'You dumped the cars on the floor and put the dolls back in the box. The dolls still exist. You are just not looking at that drawer. If you were holding a doll, you should notice.',
          },
        ],
      },
    ],
  },
  {
    id: 'camera',
    n: 7,
    title: 'Camera is walking closer',
    label: 'Camera',
    cluster: 'camera',
    gist: 'Pan and zoom change where your eyes are, not what is true. Latte still sold 67 cups. You just stepped toward the counter.',
    remember: [
      'Camera is `{ x, y, k }` — translate and scale.',
      'It must not live in the same object as selectedId or filter.',
      'Reset camera is a real button. Reset data is a refetch. Do not wire them to the same control by accident.',
    ],
    sections: [
      {
        heading: '1. Core idea',
        blocks: [
          {
            type: 'p',
            text: 'Turn **Camera** on. Scroll to zoom. Drag the empty space to pan. The HUD `camera:` pill shows the scale. The bars move. The cups do not change.',
          },
          {
            type: 'pre',
            lines: `transform = { x: 0, y: 0, k: 1 }

// zoom toward the cursor, not the origin
k2 = clamp(k * factor, 0.2, 4)
x  = px - ((px - x) * k2) / k
y  = py - ((py - y) * k2) / k`,
          },
        ],
      },
      {
        heading: '2. Why camera gets mixed in',
        blocks: [
          {
            type: 'p',
            text: 'Dashboards often “reset” on filter change: jump back to identity transform. Sometimes that is kindness. Sometimes it is a bug — you were inspecting the right edge, clicked Tea, and the camera yanked you home. Filter and camera are both intent-ish, but they are not the same intent. Change one on purpose, not as a side effect.',
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'Walking up to the toy box does not add a new toy. Stepping back does not throw one away. You just changed how big it looks.',
          },
        ],
      },
    ],
  },
  {
    id: 'derived',
    n: 8,
    title: 'Derived is never a drawer',
    label: 'Derived',
    cluster: 'derived',
    gist: 'Derived state is a question you can always re-ask. “Which drinks share a kind with the one I am holding?” If you store the answer, it will go stale the moment selection or data moves.',
    remember: [
      'Neighbors, dimmed edges, “same kind,” totals of the visible set — all derived.',
      'Computed from other clocks. Never written by a click handler.',
      'If you can `=`, you should not `=`.',
    ],
    sections: [
      {
        heading: '1. Watch the dashed rings',
        blocks: [
          {
            type: 'p',
            text: 'Turn **Derived** on. Select Latte. The other coffees get a dashed halo. You did not click them. Nothing stored `relatedIds`. A computed asked: same `kind` as `selectedId`, not including itself.',
          },
          {
            type: 'pre',
            lines: `sameKind = drinks.filter(d =>
  selected && d.kind === selected.kind && d.id !== selected.id
)`,
          },
          {
            type: 'p',
            text: 'Change selection to Matcha. The halos jump to tea. The old array was not updated. There was no old array.',
          },
        ],
      },
      {
        heading: '2. The stale-halo bug',
        blocks: [
          {
            type: 'p',
            text: 'If you store `relatedIds` on click, then change the filter, or reload the data, or clear selection, you now have a list that used to be true. Charts that “remember” highlights overnight are usually this. Derived went into a drawer.',
          },
          {
            type: 'callout',
            lines: [
              '**Attention** (`hoverId ?? selectedId`) is derived.',
              '**Visible drinks** (data + filter) is derived.',
              '**Illegal selection** (selected not in visible) is derived.',
            ],
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: '“Which toys are next to the one I am holding?” is a question. You look. You do not write the answer on a card and keep the card after you put the toy down.',
          },
        ],
      },
    ],
  },
  {
    id: 'url',
    n: 9,
    title: 'Only intent travels',
    label: 'URL',
    cluster: 'share',
    gist: 'A URL is a letter to a future you, or to a friend. Put the decision in the letter. Do not put the pointing, the walking-closer, or the question you can re-ask.',
    remember: [
      'Selection and filter may live in the URL. Hover must not.',
      'Camera is a maybe — deep links to a zoomed scatterplot can be kind; mouse-wheel spam in the query string is not.',
      'This page already does it: the lesson id is the hash. Hover is a ref.',
    ],
    sections: [
      {
        heading: '1. What this page writes',
        blocks: [
          {
            type: 'p',
            text: 'Click a lesson node. The hash becomes `#hover` or `#filter`. Reload: the same lesson opens. That is shareable intent. Sweep the mouse over bars: the hash does not flicker. That is hover staying a ref.',
          },
          {
            type: 'p',
            text: 'The HUD **url** pill shows a *pretend* chart link for the selected drink — `sel=latte`. It is the idea, drawn. The real hash on this page is the lesson, same pattern as the backend map.',
          },
        ],
      },
      {
        heading: '2. A small contract',
        blocks: [
          {
            type: 'table',
            columns: ['Clock', 'URL?'],
            rows: [
              ['Data', 'No — fetch it.'],
              ['Hover', 'Never.'],
              ['Selection', 'Yes, if the view is “this item.”'],
              ['Filter', 'Yes, if the view is “this slice.”'],
              ['Camera', 'Maybe. Prefer a Reset over a novel.'],
              ['Derived', 'Never — recompute.'],
            ],
          },
        ],
      },
      {
        heading: '3. Kid version',
        blocks: [
          {
            type: 'kid',
            text: 'A note to a friend says which toy you picked, maybe which drawer. It does not say “I was pointing at the blue one on Tuesday at 4:02.”',
          },
        ],
      },
    ],
  },
  {
    id: 'mix',
    n: 10,
    title: 'Two states, one box',
    label: 'Mix',
    cluster: 'haunt',
    gist: 'The classic viz bug is not “forgot to update the chart.” It is two clocks stuffed into one variable: `active`, `current`, `highlighted`, `focus`. One name, two jobs, a haunted picture.',
    remember: [
      'Name the clock, not the pixel: `hoverId`, `selectedId`, `filterKind`, `transform`.',
      '`active` is how mixing starts.',
      'If a handler writes two clocks, stop and split.',
    ],
    sections: [
      {
        heading: '1. The smell',
        blocks: [
          {
            type: 'pre',
            lines: `// one box, two jobs
activeId = event.type === 'mouseenter' ? id : activeId
activeId = event.type === 'click' ? id : activeId`,
          },
          {
            type: 'p',
            text: 'Now a tooltip and a detail panel both read `activeId`. Hover opens the panel. Click does nothing extra. Share copies a hover. Filter cannot know what you meant.',
          },
        ],
      },
      {
        heading: '2. Split first, library second',
        blocks: [
          {
            type: 'p',
            text: 'Pinia, props, a store, local refs — all fine once the clocks are separate. Putting a mixed `activeId` in a global store just shares the haunt with more components.',
          },
          {
            type: 'callout',
            lines: [
              'This site’s knowledge graph already splits them: `hoverId`, `selectedId`, `activeCluster`, `transform`.',
              'Neighbors are computed. The hash writes `selectedId` only.',
              'Same rules. Different picture.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'haunted',
    n: 11,
    title: 'The haunted chart',
    label: 'Haunted',
    cluster: 'haunt',
    gist: 'Turn Haunted on. Move the mouse. Selection follows pointing. The purple fill chases the gold ring. That is the bug, drawn so you can see it — hover writing into selectedId.',
    remember: [
      'Haunted mode is `selectedId = hoverId` on every enter.',
      'The HUD will show both pills changing together. That togetherness is the smell.',
      'Turn it off. Click once. Move away. Selection should stay. That is the fix.',
    ],
    sections: [
      {
        heading: '1. Break it on purpose',
        blocks: [
          {
            type: 'p',
            text: 'The **Haunted** switch is the exploit as a teaching tool. It does the one-line crime:',
          },
          {
            type: 'pre',
            lines: `function onEnter(id) {
  hoverId = id
  if (haunted) selectedId = id   // two clocks, one write
}`,
          },
          {
            type: 'p',
            text: 'Sweep the bars. Watch `selected:` in the HUD track `hover:`. The detail of “what I chose” is now whatever your mouse last touched. A URL built from that would spam history. A dashboard panel would flicker. A coworker would say “the chart is jumpy.”',
          },
        ],
      },
      {
        heading: '2. The fix is deletion',
        blocks: [
          {
            type: 'p',
            text: 'You do not add a debounce. You do not add `isClicking`. You stop writing selection in the hover handler. Two boxes. One write each.',
          },
          {
            type: 'kid',
            text: 'If pointing at snacks puts every snack on your lunch tray, the tray is haunted. Pointing and packing are different jobs.',
          },
        ],
      },
    ],
  },
  {
    id: 'rule',
    n: 12,
    title: 'One rule',
    label: 'Rule',
    cluster: 'clocks',
    gist: 'Derived never stored. Hover never persisted. Intent may live in the URL. Camera is a view, not a fact. Data does not care that you pointed.',
    remember: [
      'Five clocks, one picture, separate boxes.',
      'If the HUD pills move in lockstep and they should not, you mixed them.',
      'Name the clock. The library is clothes.',
    ],
    sections: [
      {
        heading: '1. The contract',
        blocks: [
          {
            type: 'table',
            columns: ['Clock', 'Lives for', 'Store it?', 'URL?'],
            rows: [
              ['Data', 'Until the fetch', 'Yes, as source', 'No'],
              ['Hover', 'Milliseconds', 'A ref', 'Never'],
              ['Selection', 'Until you change your mind', 'Yes', 'Yes'],
              ['Filter', 'Until you change the slice', 'Yes', 'Yes'],
              ['Camera', 'Until you pan away', 'Yes, local', 'Maybe'],
              ['Derived', 'Never — recompute', 'No', 'Never'],
            ],
          },
        ],
      },
      {
        heading: '2. Kid version',
        blocks: [
          {
            type: 'kid',
            items: [
              'Toys (data). Pointing (hover). Holding (selection). Which drawer (filter). Walking closer (camera). “What’s next to this?” (derived). The note to a friend (URL).',
              'Do not write pointing on the note. Do not keep the “what’s next to this” card after you put the toy down.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'graph',
    n: 13,
    title: 'The map you already clicked',
    label: 'Graph',
    cluster: 'clocks',
    gist: 'The backend first-principle map on this site is the same idea with different paint: hoverId, selectedId, activeCluster, transform, computed neighbors, hash for the lesson. You already built the clocks. This note names them.',
    remember: [
      'A knowledge graph is a visualization. It has the same clocks as a bar chart.',
      'Selection opens the lesson. Hover only thickens the stroke.',
      'Cluster filter dims nodes. Pan/zoom is camera. Neighbors are derived.',
    ],
    sections: [
      {
        heading: '1. Same clocks, bigger picture',
        blocks: [
          {
            type: 'p',
            text: 'If this café chart clicked, the 31-node map is the same machine. Node glow on mouseenter. Lesson on click. Hash writes the lesson id. Cluster legend is a filter. The force layout’s `x, y` are *positions*, not data — closer to camera and simulation than to “HTTP is lesson 2.”',
          },
          {
            type: 'p',
            text: 'State management in visualization is not a special library topic. It is this split, over and over, every time a picture has to remember more than one kind of truth.',
          },
          {
            type: 'callout',
            lines: [
              'Watch the HUD until the pills feel obvious.',
              'Turn Haunted on once, then off.',
              'Then go back to the backend map and you will see the clocks sitting on those nodes too.',
            ],
          },
        ],
      },
    ],
  },
];

export function topicById(id: string) {
  return topics.find((topic) => topic.id === id);
}

export const topicsInOrder = [...topics].sort((a, b) => a.n - b.n);

export function neighborTopics(id: string) {
  const index = topicsInOrder.findIndex((topic) => topic.id === id);
  return {
    prev: index > 0 ? topicsInOrder[index - 1] : null,
    next: index >= 0 && index < topicsInOrder.length - 1 ? topicsInOrder[index + 1] : null,
  };
}

export function drinkById(id: string | null) {
  if (!id) return null;
  return drinks.find((drink) => drink.id === id) ?? null;
}
