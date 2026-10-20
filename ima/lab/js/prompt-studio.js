// Her premise için öğrenci karar şablonu ve doldurulmuş örnek. AI'a veri göndermez.
window.PL_PROMPTS = (() => {
 const chapters = {
  '01': {
   focus: 'What can a participant intentionally control, and what remains your decision?',
   title: 'Light Composer',
   fields: [
    ['Participant goal', 'Compose a short light rhythm, then repeat it intentionally.'],
    ['Input and accessible alternative', 'A, S, D and F keys, plus four labelled touch buttons. Identify each button by a letter and shape, not colour alone.'],
    ['Control and mapping', 'A → left coral circle; S → centre yellow triangle; D → right blue square; F → upper white ring. Participants choose which light, when it starts, and how long they hold it.'],
    ['Rule and state', 'A held input lights its shape. Releasing it starts a 500 ms fade. Multiple inputs may be held together; the same input always has the same mapping. Track each held input separately.'],
    ['Limits of control', 'Shape positions, colours and fade duration are my design decisions. Participants cannot edit them during play.'],
    ['Feedback and visual language', 'Dark navy stage, four large geometric shapes, simple type. The matching screen button lights too. No sound, score, countdown or win condition.']
   ],
   comparison: 'Add Individual and Together modes. Individual maps each input to its own shape. Together lights all shapes while ANY input is held; releasing one input must not turn them off while another remains held. Clear held inputs and fading lights when switching modes. Ask a partner to repeat the same chosen rhythm in both modes. Ask which intended choices they could carry out and which stayed outside their control; do not infer their answer.',
   edge: 'Ignore key repeat. Clear held inputs on window blur and pointer cancellation. Use pointer capture for touch buttons; a released or cancelled pointer must never leave a light stuck on.'
  },
  '02': {
   focus: 'How does an earlier turn change the system’s next reply?',
   title: 'Echo Garden',
   fields: [
    ['Participant goal', 'Discover how to keep a conversation going with three animated leaves.'],
    ['Input and accessible alternative', 'Tap or click a leaf. Each leaf is also a labelled native button operable with Tab, Enter or Space.'],
    ['History that matters', 'Remember the timestamps of taps on each leaf over the last two seconds. Three taps in that window make that leaf withdraw.'],
    ['Response states and next turns', 'A calm leaf opens on a tap and holds an inviting pose. Three quick taps move it to a withdrawn pose for two seconds. After that pause it becomes available again; a new slow tap can reopen it. Show a brief status describing the reply.'],
    ['Participant and designer decisions', 'The participant chooses the leaf and pace, including the choice to stop. I set the repetition window, tap threshold and recovery duration. Do not present the animation as an actual emotion or understanding of the person.'],
    ['Visual language', 'Cream field, dark green geometric leaves and small mono labels. Posture and a text label identify calm, open and withdrawn states. No sound or reward score.']
   ],
   comparison: 'Provide Immediate reply and Remember earlier turns modes. Immediate reply always opens an available leaf and never withdraws it for repeated taps. Remember earlier turns uses the two-second tap history. Keep the same leaf layout, input and animation durations in both modes. Clear all history when changing modes. Try the same tap sequence in each, then let a partner choose their next gesture. Ask how the reply affected what they did next.',
   edge: 'Use one clock and explicit state transitions; do not let overlapping timers reopen a withdrawn leaf early. Clear history on reset. Keyboard activation and pointer activation should each produce exactly one turn.'
  },
  '03': {
   focus: 'Which hidden state must become understandable for someone to predict and correct an action?',
   title: 'Hidden Reservoir',
   fields: [
    ['Participant goal', 'Try to stop a draining reservoir close to 50 units, then explain how you decided when to act.'],
    ['Input and accessible alternative', 'Native Add 10, Start draining, Pause and Reset buttons. All work with keyboard, pointer and touch.'],
    ['State and rule', 'Store a level from 0 to 100 and a running/paused flag. Add 10 increases the level by 10 up to capacity. While running, drain exactly five units per second, clamped at zero.'],
    ['Action acknowledgement', 'Briefly mark Add 10 when an action is received. This means only that the action was received, not that the target level was reached.'],
    ['State feedback', 'In Full feedback mode show a filled tank, numeric level and Running/Paused/Empty label. In Acknowledgement only mode show the button acknowledgement but hide the live level and status until the participant presses Reveal result.'],
    ['Visual language', 'White page, one indigo tank and plain labels. Keep values readable and avoid colour as the only signal. Announce state changes accessibly without continuously announcing every animation frame.']
   ],
   comparison: 'Keep the actual capacity, drain rate and controls identical in both feedback modes. Begin each attempt at 80 units, paused. Ask a partner to try the same stopping task in each mode and press Reveal result at the end. Record their explanation and whether they repeated an input or hesitated. Discuss what they could infer from each signal; do not claim the hidden condition is inaccessible information that an assistive device should still reveal.',
   edge: 'Use elapsed time, not frame counts, for draining. Prevent duplicate animation loops after repeated Start presses. Pause when the document is hidden. The hidden-feedback comparison must hide the same task information visually and from assistive output until Reveal result.'
  },
  '04': {
   focus: 'How do duration and the memory of earlier actions become part of the interaction?',
   title: 'Echo Cursor',
   fields: [
    ['Participant goal', 'Guide an echo through three marked places by planning the timing of a path.'],
    ['Input and accessible alternative', 'Move a pointer or drag on a touch surface to position a live marker. Arrow keys move the same marker while the stage has focus.'],
    ['Temporal rule', 'Store timestamped positions of the live marker. The echo follows that recorded path with a configurable delay; interpolate between samples.'],
    ['Present and past state', 'The live marker shows the current input. A differently shaped echo shows the position from the selected time in the past. A thin trail shows the recent path.'],
    ['Boundaries and memory', 'Keep both markers inside the stage. Retain only the history needed for a two-second delay and a short trail. There are no collisions, penalties or scores.'],
    ['Visual language', 'White stage, black live dot, outlined coral echo and three numbered destinations. Labels explain Present and Echo; time is not communicated through colour alone.']
   ],
   comparison: 'Offer Immediate and Two-second echo modes. Keep input speed, stage, destinations and trail duration unchanged; change only the echo delay from 0 to 2000 ms. Clear the recorded path when switching. Show Waiting for history until enough time has been recorded. Ask a partner to guide the echo through the same destinations in each mode and describe how they anticipated the next movement.',
   edge: 'Use timestamps and elapsed time so the delay is stable across frame rates. Freeze both simulation time and history when the document is hidden. Reset removes all recorded positions. Avoid flashing; reduced-motion mode can keep the markers while omitting the decorative trail.'
  },
  '05': {
   focus: 'Which rules open or close the actions and outcomes someone can explore?',
   title: 'Rule Garden',
   fields: [
    ['Participant goal', 'Arrange seeds, water and walls to make several different garden layouts.'],
    ['Input and accessible alternative', 'Choose a Seed, Water, Wall or Erase tool and activate cells of a 6 × 6 board. Cells are labelled buttons in a keyboard-operable grid. Include a Step button.'],
    ['Materials and state', 'Each cell contains exactly one of empty, seed, plant, water or wall. Show its material using both a symbol and a colour. There are no hidden resources.'],
    ['Growth rule', 'On Step, a seed becomes a plant if at least one orthogonally adjacent cell contains water. Evaluate all growth from a snapshot of the board so cell order cannot change the outcome.'],
    ['Constraints', 'Walls block placement and never become plants. Other materials can be replaced by the selected tool. In Locked walls mode, a placed wall cannot be erased or replaced until Reset; in Editable walls mode it can.'],
    ['Visual language', 'Paper-white board with ochre seeds, green plants, blue water and hatched walls. No target image, score or winning layout. Let participants discover their own arrangements.']
   ],
   comparison: 'Start both wall modes from the same empty board. Keep growth, tools, board size and unlimited materials unchanged; vary only whether a wall can be removed. Ask a partner to construct a layout, then try to make a different one after placing walls. Discuss which transformations remain possible, not whether they matched a preferred final picture. Reset before each new attempt.',
   edge: 'Separate board state from its rendering. Reject edits to locked walls consistently for every input route. Announce why a requested edit was unavailable. Keep a visible way to reset so an irreversible move does not trap the participant.'
  },
  '06': {
   focus: 'Which conditions beyond the screen change what the system can sense and do?',
   title: 'Shadow Shelter',
   fields: [
    ['Participant goal', 'Use a body silhouette to shelter falling letter shapes, then explore how the same gesture reads in different lighting.'],
    ['Input and alternative route', 'Offer an explicit Start camera button and a Pointer shelter mode that works without a camera. Pointer, touch and arrow keys position the same virtual shelter in that alternative mode.'],
    ['Camera interpretation', 'After permission, capture a low-resolution empty-scene reference when I press Calibrate. Compare each new frame with the reference, threshold the luminance difference and form a coarse silhouette mask. Label it Motion/background difference: it is not reliable person recognition.'],
    ['Mapping and state', 'Letters drift downwards. A letter touching the current shelter mask rests briefly then fades. In Pointer shelter mode, use a clearly drawn umbrella-shaped region instead of a camera-derived mask.'],
    ['Context and limits', 'Ambient light, framing, background movement and camera placement affect the mask. Expose threshold and recalibration controls. Process frames in the browser only; do not record, upload or persist camera images. Stop camera tracks when Stop camera is pressed or the route changes.'],
    ['Visual language', 'White paper field, dark letters and a pale blue shelter overlay. Show which input route is active. Camera denial or absence must leave the alternative route fully usable.']
   ],
   comparison: 'In camera mode, try the same slow gesture with stable light and then changed light or a moving background. Keep the difference threshold and letter behaviour fixed while comparing; show the interpretation mask so its limits are visible. Afterwards, test whether recalibration changes the result. Pointer shelter is a useful alternative route, but do not claim it is an equivalent measurement of the physical setting. Ask what the sensor missed or interpreted differently.',
   edge: 'Request camera permission only after a deliberate action. Handle unavailable, denied or disconnected cameras. Explain when a fresh empty-scene calibration is needed. Release streams and animation resources on teardown. Do not access a microphone or infer identity.'
  },
  '07': {
   focus: 'Which local rules can generate a collective pattern you did not draw in advance?',
   title: 'Neighbourhood Flock',
   fields: [
    ['Participant goal', 'Explore how many small local decisions form, break and reform a moving collective.'],
    ['Participant input', 'Provide native sliders for separation, alignment and cohesion, plus Pause, Step and Reset. Controls work with keyboard and touch. The participant changes conditions, not individual paths.'],
    ['Agents and local rules', 'Start 60 agents from a reproducible seed of 314. Each agent senses only neighbours within a set radius. Separation steers away from nearby agents, alignment matches neighbour velocity, and cohesion steers towards their local centre.'],
    ['State and constraints', 'Store position and velocity for each agent. Limit acceleration and speed, and wrap at the stage edges. Compute every agent’s next state from the same current-state snapshot.'],
    ['What is not prescribed', 'Do not steer towards a global picture, add a hidden leader or switch to a pre-rendered flock animation. Do not promise that one parameter always creates a particular shape.'],
    ['Visual language', 'White field, indigo arrow-like agents and small parameter labels. An optional selected-agent overlay shows only that agent’s sensing radius. No score or ideal outcome.']
   ],
   comparison: 'Add paired presets Alignment off (0) and Alignment on (0.4). Keep separation, cohesion, radius, speed, agent count, boundary rule and initial seed identical. Reset the same initial arrangement before each run. Observe for the same duration and record clusters, direction changes or surprises without naming a pattern before it appears. Ask which outcome was specified directly and which arose through interactions.',
   edge: 'Guard zero-length vectors, empty neighbourhoods and agents at identical coordinates. Use elapsed time with a capped step; Pause and Step must advance the same rule. Changing the random seed should change the starting condition, not the local rules.'
  },
  '08': {
   focus: 'What change are you proposing in a real shared situation, and who can accept or refuse it?',
   title: 'Turn Lantern',
   fields: [
    ['Situation and design question', 'In a willing group of three or four classmates discussing a design, investigate whether a visible request queue changes how turns are negotiated. This is a small situated prototype, not a proven improvement.'],
    ['Participant choices', 'Use role labels A, B, C and D without collecting names. Each role has Request turn and Cancel request buttons. Everyone can see the queue, choose not to use it or end the trial.'],
    ['Rule and state', 'A request adds its role to a first-in-first-out queue, at most once. The first role is shown as Invited to speak. A Finish turn button removes that role. Anyone may cancel their own request. Reset clears the queue.'],
    ['Human control', 'The display suggests a speaking order; it must not mute, time-limit, rank or penalise anyone. There is no automatic detection of speaking. The group can ignore the suggestion or stop.'],
    ['Feedback', 'Show the invited role and upcoming requests with text and shapes. Announce queue changes accessibly. Label the buttons clearly so the shared screen can be operated with keyboard or touch.'],
    ['Visual language', 'Quiet cream page with a blue lantern for the current invitation. No traffic-light judgement of good or bad participants, individual scores or recording.']
   ],
   comparison: 'Before using the prototype, ask the group whether they want to try it and what a useful change would mean to them. Compare a short discussion without the display with one using it, keeping the group, topic difficulty and duration similar. Ask about interruptions, participation and feeling free to disagree; record only observations everyone agrees to share. Acknowledge the order and small sample as limitations. Do not claim causation, effectiveness or broader outcomes from this trial.',
   edge: 'Prevent duplicate requests and handle cancelling the current invitation or the last request. Provide Stop trial as well as Reset. Keep participant data in memory only. Make no claim that a single-browser role-labelled prototype enforces private permissions.'
  }
 };
 const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const memory = new Map();
 const key = id => 'ima-lab-prompt-v1-' + id;
 function draft(id) {
  if (memory.has(id)) return memory.get(id);
  try { const value = localStorage.getItem(key(id)); if (value !== null) { memory.set(id,value); return value; } } catch {}
  return null;
 }
 function prompt(m, example = false) {
  const c = chapters[m.id];
  const decisions = c.fields.map(([label,value]) => '- ' + label + ':\n  ' + (example ? value : '[My decision]')).join('\n\n');
  return `Help me design and build a small browser-based interactive experience exploring ${m.name}.
Premise: ${m.premise}
Promise: ${m.promise}

DESIGN QUESTION
${c.focus}

MY IDEA
${example ? c.title : '[My title, setting and experience idea]'}

MY DESIGN DECISIONS
${decisions}

COMPARISON TO TRY
${example ? c.comparison : '[Choose two conditions or rules to compare. State what changes, what stays the same, how each attempt begins, what a participant will try, and what you will observe or ask. Do not assume the result.]'}

BEFORE CODING
1. Help me complete any unanswered design decisions. Offer a few options and explain their consequences; do not decide for me.
2. Summarise my decisions as input → rule → state → output. Explain how they make ${m.name} visible.
3. Distinguish my control as the designer from the control I give the participant. Identify any contradiction or untested assumption.
4. Present a short implementation proposal and wait for my approval before writing code.

AFTER I APPROVE
- Use plain HTML, CSS and JavaScript, without libraries, external services or a build step. Provide index.html, style.css and script.js as separate files.
- Put adjustable colours, sizes, timings, thresholds and rule settings in a DESIGN object at the top of script.js. Explain how each setting changes behaviour.
- Organise the JavaScript as DESIGN → state → input → rule → output. Keep design rules separate from rendering.
- Write interface text in English and code comments and setup notes in Turkish.
- Include clear controls, a working reset and an equivalent input route for keyboard and touch where applicable. Do not use colour as the only meaningful signal.
- ${example ? c.edge : 'Ask about relevant edge cases, input cancellation, pause and reset. Explain your handling before making a design choice.'}
- Do not introduce a score, goal, mechanic, data collection or dependency I did not request. Ask before changing my decisions.

TRY, OBSERVE, REVISE
Give me a short local setup guide and a manual check for the rules and reset.
Suggest a small comparison I can try with a willing classmate. Ask for their observations rather than inventing a user-test result.
Help me explain what I changed, what happened and what I would revise next. Do not write my observations or conclusions for me.`;
 }
 function render(m) {
  const c = chapters[m.id], value = draft(m.id) ?? prompt(m);
  return `<section class="pl-prompt-studio" data-prompt-studio="${m.id}" aria-labelledby="prompt-title-${m.id}">
   <span class="gw-label gw-red">BUILD YOUR OWN / ${esc(m.name.toUpperCase())}</span>
   <h3 id="prompt-title-${m.id}">Your decisions. A new experience.</h3>
   <p>Make the design decisions yours. Use AI to build, explain and revise them.</p>
   <p class="pl-prompt-focus">${esc(c.focus)}</p>
   <ol class="pl-prompt-steps"><li>Fill in your choices.</li><li>Ask AI to explain the plan before coding.</li><li>Build, compare and revise.</li></ol>
   <details class="pl-prompt-editor" open><summary>Write your prompt</summary>
    <label for="prompt-draft-${m.id}">My ${esc(m.name)} prompt</label>
    <p class="gw-small" id="prompt-help-${m.id}">Replace [My decision] with your choices. This editor sends nothing to an AI service. Copy the prompt into the tool you choose.</p>
    <textarea id="prompt-draft-${m.id}" data-prompt-draft spellcheck="false" rows="16" aria-describedby="prompt-help-${m.id}">${esc(value)}</textarea>
    <div class="pl-prompt-actions"><button type="button" class="gw-solid" data-copy-prompt="draft">Copy my prompt</button><span class="gw-small" data-prompt-save></span></div>
   </details>
   <details class="pl-prompt-example"><summary>Worked example / ${esc(c.title)}</summary>
    <p>This is one possible design, not a model answer. Change the theme and the rules deliberately.</p>
    <pre data-prompt-example>${esc(prompt(m,true))}</pre>
    <button type="button" data-copy-prompt="example">Copy worked example</button>
   </details>
   <p class="gw-small pl-prompt-status" role="status" data-prompt-status></p>
  </section>`;
 }
 function mount(container) {
  const section = container.querySelector('[data-prompt-studio]'); if (!section) return;
  const id = section.dataset.promptStudio, editor = section.querySelector('[data-prompt-draft]');
  const status = section.querySelector('[data-prompt-status]'), save = section.querySelector('[data-prompt-save]');
  if (draft(id) !== null) save.textContent = 'Your saved draft';
  editor.addEventListener('input', () => {
   memory.set(id,editor.value);
   try { localStorage.setItem(key(id),editor.value); save.textContent = 'Saved in this browser'; }
   catch { save.textContent = 'Kept for this visit; copy it before closing'; }
  });
  section.addEventListener('click', async event => {
   const button = event.target.closest('[data-copy-prompt]'); if (!button) return;
   const example = button.dataset.copyPrompt === 'example';
   const text = example ? section.querySelector('[data-prompt-example]').textContent : editor.value;
   if (!text.trim()) { status.textContent = 'Write your design decisions before copying.'; editor.focus(); return; }
   try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = example ? 'Worked example copied. Your own draft is unchanged.' : 'Your prompt is copied. Paste it into your chosen AI tool.';
   } catch {
    if (example) {
     const range = document.createRange(); range.selectNodeContents(section.querySelector('[data-prompt-example]'));
     const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    } else { editor.focus(); editor.select(); }
    status.textContent = 'Automatic copying is unavailable. The text is selected; use your browser’s Copy command.';
   }
  });
 }
 return {render,mount,prompt};
})();
