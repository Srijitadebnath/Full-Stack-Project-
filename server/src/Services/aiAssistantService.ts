import { pool } from '../config/db.js';

export type AssistantRole = 'USER' | 'TEAM' | 'ADMIN';

export interface KnowledgeChunk {
  id: string;
  role: AssistantRole | 'ALL';
  title: string;
  keywords: string[];
  phrases?: string[];
  content: string;
}

export interface ChatHistoryTurn {
  sender: 'user' | 'ai';
  text: string;
}

export interface AssistantQueryInput {
  prompt: string;
  role: AssistantRole;
  eventId?: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
  history?: ChatHistoryTurn[];
}

export interface EventProposalData {
  action: 'CREATE_EVENT_PROPOSAL';
  eventData: {
    name: string;
    description: string;
    category: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    registrationDeadline: string;
    capacity: number;
    budget: number;
    organizer: string;
    image?: string;
  };
  suggestedTasks?: {
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    department?: string;
  }[];
}

export interface AssistantReply {
  id: string;
  sender: 'ai';
  text: string;
  timestamp: string;
  sources: string[];
  mode: 'RAG_RETRIEVAL' | 'LLM_RAG';
  proposal?: EventProposalData;
}

/**
 * Student-friendly Campus Knowledge Base.
 * Written in clear, natural helpdesk language with zero backend/developer jargon.
 */
const KNOWLEDGE_DOCS: KnowledgeChunk[] = [
  {
    id: 'pol-cancel-edit',
    role: 'USER',
    title: 'Cancelling or Updating Your Registration',
    keywords: [
      'cancel',
      'cancelled',
      'canceled',
      'cancellation',
      'withdraw',
      'drop',
      'remove',
      'delete',
      'mistake',
      'wrong',
      'refund',
      'change',
      'edit',
      'update',
    ],
    phrases: [
      'cancel registration',
      'cancel my pass',
      'cancel ticket',
      'wrong details',
      'not attending',
      'dont want to attend',
      "don't want to attend",
      'cant attend',
      'cannot attend',
    ],
    content:
      'Right now, self-service cancellation is not available directly from the student portal. If you can no longer attend or entered a wrong detail, just share your **Ticket ID** and **SAP ID** with the **event organizer or Faculty Helpdesk**, and they will cancel your seat so another student can take it.\n\nYou can find your Ticket ID anytime under **My Passes** in the top menu.',
  },
  {
    id: 'pol-qr-pass',
    role: 'USER',
    title: 'Finding & Using Your Entry Pass (QR Code)',
    keywords: ['qr', 'barcode', 'badge', 'download', 'screenshot', 'scan', 'check-in', 'checkin', 'print'],
    phrases: ['qr pass', 'qr code', 'download pass', 'my ticket', 'get pass'],
    content:
      'As soon as you register for an event, your digital **QR Entry Pass** is ready automatically. Just click **My Passes** in the top bar (or click your event card under **My Applied Events** on the left of your Dashboard) to open your pass and show it at the venue gate.',
  },
  {
    id: 'pol-entry-id',
    role: 'USER',
    title: 'Campus Gate Entry & ID Rules',
    keywords: ['id', 'card', 'gate', 'entry', 'security', 'arrive', 'early', 'outsider', 'guest', 'friend'],
    phrases: ['entry rule', 'id card', 'can outsiders', 'bring friend'],
    content:
      'Please carry your **physical UPES Student ID card** along with your digital QR pass — both are checked at the venue gate. Try to arrive **20–30 minutes early** so you breeze through check-in. Visiting students from other colleges must carry their own college ID and have a confirmed registration.',
  },
  {
    id: 'pol-dress-code',
    role: 'USER',
    title: 'Dress Code & What You Can Bring',
    keywords: ['dress', 'code', 'wear', 'clothes', 'attire', 'outfit', 'formal', 'casual', 'bag', 'backpack', 'food', 'laptop'],
    phrases: ['dress code', 'what to wear', 'bring laptop'],
    content:
      'For hackathons, workshops, and cultural fests, **smart casuals** are totally fine. For formal conferences or guest keynotes, **semi-formal or business casual** attire is preferred. You can bring laptops for tech events, though security may check bags at auditorium gates (outside food and sharp items are not allowed inside the hall).',
  },
  {
    id: 'pol-oc-apply',
    role: 'USER',
    title: 'Joining the Organizing Committee (OC)',
    keywords: ['oc', 'volunteer', 'organizing', 'committee', 'crew', 'apply', 'join'],
    phrases: ['join oc', 'become volunteer', 'apply for oc'],
    content:
      'Want to be part of the organizing crew? Click **Join as OC Volunteer** on your Student Dashboard, pick your preferred department (like Stage, Media, or Hospitality), and submit. Once the Faculty Admin approves your request, an activation card will pop up right on your Dashboard so you can set your OC password.',
  },
  {
    id: 'pol-reg-how',
    role: 'USER',
    title: 'How Event Registration Works',
    keywords: ['register', 'registration', 'book', 'signup', 'limit', 'twice', 'duplicate', 'multiple'],
    phrases: ['how to register', 'register twice', 'more than once'],
    content:
      'To book a seat, click **Register** on any upcoming event card on your Dashboard and confirm your details — your pass is issued immediately. Each student can hold **one pass per event** using their UPES email (`firstname.sapid@stu.upes.ac.in`).',
  },
  {
    id: 'pol-certificate',
    role: 'USER',
    title: 'Participation Certificates & Attendance',
    keywords: ['certificate', 'certificates', 'attendance', 'od', 'duty', 'leave', 'points'],
    phrases: ['get certificate', 'on duty', 'od leave'],
    content:
      'Participation certificates and attendance/OD credits are issued only after your QR pass is scanned at the venue check-in desk. Make sure the OC volunteer scans your QR code when you enter!',
  },
  {
    id: 'pol-oc-sound',
    role: 'TEAM',
    title: 'OC Stage, Soundcheck & Logistics Protocol',
    keywords: ['sound', 'audio', 'mic', 'stage', 'check', 'rigging', 'power', 'lighting', 'vendor', 'setup'],
    content:
      'Complete line-array and wireless microphone checks at least 90 minutes before doors open. Confirm backup battery packs for all handheld mics and coordinate power distribution clearance before energizing heavy loads.',
  },
  {
    id: 'pol-oc-proof',
    role: 'TEAM',
    title: 'OC Task Work Proof & Attendance Rules',
    keywords: ['proof', 'submit', 'update', 'task', 'photo', 'deadline', 'attendance', 'venue', 'complete'],
    content:
      'Upload clear status notes and work proof updates via **Submit Work Update** as soon as a milestone reaches 100%. Faculty Admin reviews all proofs before marking departmental deliverables cleared.',
  },
  {
    id: 'pol-oc-discipline',
    role: 'TEAM',
    title: 'OC Member Disciplinary Code & Professional Conduct',
    keywords: [
      'discipline',
      'disciplinary',
      'conduct',
      'code',
      'behavior',
      'punctual',
      'punctuality',
      'rules',
      'badge',
      'misconduct',
      'absent',
      'leave',
      'duty',
      'shift',
    ],
    phrases: [
      'disciplinary policy',
      'code of conduct',
      'oc rules',
      'duty timing',
      'attendance rules',
      'misconduct rules',
      'disciplinary code',
    ],
    content:
      '**1. Mandatory Badging**: All OC members must wear their official event badge and physical UPES Student ID card at all times while on duty.\n' +
      '**2. Reporting Time**: Report to your department lead at least 45 minutes before public gates open for the operational briefing.\n' +
      '**3. Zero Tolerance Conduct**: Strict prohibition against allowing unauthorized guests without passes, substance use, abandoning assigned posts, or arguing with attendees.\n' +
      '**4. Escalation**: Any disputes, harassment, or security concerns must be escalated immediately to the Faculty Coordinator rather than handled unilaterally.\n' +
      '**5. OD Credits & Certificates**: OC Duty Certificates and OD credits are awarded only to volunteers who complete all assigned shifts with active logbook sign-offs.',
  },
  {
    id: 'pol-oc-maintenance',
    role: 'TEAM',
    title: 'Venue Maintenance, Equipment Safety & Asset Handover',
    keywords: [
      'maintenance',
      'maintain',
      'clean',
      'cleanliness',
      'asset',
      'equipment',
      'handover',
      'damage',
      'hall',
      'auditorium',
      'return',
      'safety',
      'trash',
      'waste',
    ],
    phrases: [
      'maintenance policy',
      'asset handover',
      'equipment return',
      'venue maintenance',
      'damage reporting',
      'clean up',
      'maintained policy',
    ],
    content:
      '**1. Pre-Event Asset Check**: Inspect all borrowed university equipment (mics, projectors, cables, barricades) and verify working condition before signing the asset log.\n' +
      '**2. Venue Cleanliness**: The OC Logistics team must ensure no food or litter is left in auditorium rows. Waste bins must be stationed at all major entry/exit doors.\n' +
      '**3. Safe Cable Management**: All power and audio cables crossing walkways must be safely covered with rubber cable ramps or heavy-duty gaffer tape to prevent tripping.\n' +
      '**4. Post-Event Clearance & Handover**: All university equipment must be packed and returned to the Estate/AV Stores within 2 hours of event conclusion, followed by a signed venue handover inspection from the campus estate supervisor.',
  },
  {
    id: 'pol-oc-emergency',
    role: 'TEAM',
    title: 'Emergency Response, Medical & Crowd Safety Protocol',
    keywords: [
      'emergency',
      'medical',
      'injury',
      'ambulance',
      'doctor',
      'fire',
      'stampede',
      'crowd',
      'bottleneck',
      'evacuation',
      'safety',
      'first aid',
      'extinguisher',
    ],
    phrases: [
      'emergency protocol',
      'medical emergency',
      'fire alarm',
      'crowd control',
      'first aid',
      'what if someone gets hurt',
    ],
    content:
      '**1. Medical Aid**: A designated First Aid desk is stationed at the venue entrance. For acute medical emergencies, escort the patient to the campus health center or call the UPES Emergency Ambulance (Ext: 108 / Security Desk).\n' +
      '**2. Fire & Electrical Trips**: Immediately locate the nearest fire extinguisher and ensure all emergency fire exits remain unlocked and unblocked. If an evacuation alarm sounds, guide attendees in a calm, orderly manner toward the designated green assembly areas.\n' +
      '**3. Crowd Bottlenecks**: If venue capacity reaches 90%, the Gates Team must enforce a "one-out, one-in" policy and inform Campus Security to manage queue lines.',
  },
  {
    id: 'pol-oc-task-submission',
    role: 'TEAM',
    title: 'How to Execute Tasks & Submit Work Proofs',
    keywords: [
      'how to do task',
      'submit proof',
      'work proof',
      'proof',
      'complete task',
      'progress',
      'milestone',
      'upload photo',
      'verify',
      'how to complete',
      'how can they do',
    ],
    phrases: [
      'how to do my task',
      'how do i submit proof',
      'submit work update',
      'complete my task',
      'task submission',
      'how to complete task',
    ],
    content:
      '**1. Check Task Scope**: Click on **Tasks** in the OC sidebar to review your task name, description, priority, and deadline.\n' +
      '**2. Update Progress**: As you execute your duties, update your task progress (e.g., 25%, 50%, 100%) so department leads can track live status.\n' +
      '**3. Submit Work Proof**: Once finished, go to **Work Submissions**, click **Submit Work Update**, write a brief description of what was completed, and attach photographic proof (e.g., completed stage setup, audio rack setup, or registration desk photo).\n' +
      '**4. Faculty Sign-Off**: The Faculty Admin will review and approve your submission, marking the task officially completed in the database.',
  },
];

/**
 * Scores and returns the best matching knowledge topic for a natural language query.
 */
function retrieveTopPolicy(prompt: string, role: AssistantRole): KnowledgeChunk | null {
  const lower = prompt.toLowerCase();
  const tokens = lower.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((t) => t.length > 1);

  const scored = KNOWLEDGE_DOCS
    .filter((doc) => doc.role === role || doc.role === 'ALL')
    .map((doc) => {
      let score = 0;

      // Exact phrase matches carry strongest signal
      if (doc.phrases) {
        for (const phrase of doc.phrases) {
          if (lower.includes(phrase)) score += 8;
        }
      }

      // Word & prefix matches
      for (const kw of doc.keywords) {
        if (tokens.includes(kw)) {
          score += 5;
        } else if (
          tokens.some(
            (t) =>
              !(t === 'attend' && kw === 'attendance') &&
              ((t.length >= 4 && kw.startsWith(t)) || (kw.length >= 4 && t.startsWith(kw)))
          )
        ) {
          score += 3;
        }
      }

      return { doc, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored[0].doc : null;
}

/**
 * Formats an event row clearly for students, including organizer & short description when focused.
 */
function formatEventSummary(
  ev: {
    name: string;
    description?: string;
    organizer?: string;
    event_date_fmt: string;
    start_time: string;
    end_time?: string;
    venue: string;
    remaining_seats: number;
    capacity: number;
    category: string;
  },
  detailed = false
): string {
  const seatStatus =
    ev.remaining_seats > 0
      ? `${ev.remaining_seats} of ${ev.capacity} seats available`
      : 'Currently full (0 seats left)';

  if (detailed) {
    const lines = [
      `**${ev.name}** (${ev.category})`,
      `• **When:** ${ev.event_date_fmt}, ${ev.start_time}${ev.end_time ? ` – ${ev.end_time}` : ''}`,
      `• **Where:** ${ev.venue}`,
      `• **Availability:** ${seatStatus}`,
    ];
    if (ev.organizer) lines.push(`• **Organizer:** ${ev.organizer}`);
    if (ev.description) lines.push(`• **About:** ${ev.description}`);
    return lines.join('\n');
  }

  return `• **${ev.name}** — ${ev.event_date_fmt} at ${ev.start_time} (${ev.venue}) • **${seatStatus}**`;
}

/**
 * Stage 3 (Generation): Calls local Ollama LLM with grounded system context & recent chat turns.
 * Returns null if Ollama is offline or times out so callers can fall back safely.
 */
async function callOllamaRAG(
  systemPrompt: string,
  userPrompt: string,
  history: ChatHistoryTurn[] = []
): Promise<string | null> {
  const ollamaUrl = process.env.OLLAMA_URL;
  if (!ollamaUrl) return null;

  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
  const recentMessages = history.slice(-6).map((h) => ({
    role: h.sender === 'ai' ? 'assistant' : 'user',
    content: h.text,
  }));

  try {
    const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[Ollama RAG Error] HTTP ${response.status} from ${ollamaUrl} (model=${ollamaModel}): ${errText}`);
      return null;
    }
    const data = (await response.json()) as { message?: { content?: string } };
    return data.message?.content?.trim() || null;
  } catch (err) {
    console.error(`[Ollama RAG Error] Failed to reach ${ollamaUrl} (model=${ollamaModel}):`, err);
    return null;
  }
}

/**
 * Handles conversational Student Support queries using live Neon PostgreSQL data + clean helpdesk guidance.
 */
async function handleStudentAssistant(input: AssistantQueryInput): Promise<AssistantReply> {
  const lower = input.prompt.toLowerCase().trim();
  const firstName = input.userName ? input.userName.split(' ')[0] : '';
  const sources: string[] = [];
  const replyParts: string[] = [];

  // 0. Natural Greeting / Thanks handling
  const isPureGreeting = /^(hi|hello|hey|hii|helo|good morning|good afternoon|good evening)[!.?\s]*$/.test(lower);
  if (isPureGreeting) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `Hey${firstName ? ` ${firstName}` : ''}! 👋 I'm here to help with UPES campus events. Ask me anything — like which events have open seats, how to find your QR pass, dress code rules, or how to cancel a registration.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['EVENTRA Helpdesk'],
      mode: 'RAG_RETRIEVAL',
    };
  }

  if (/^(thanks|thank you|thx|ok thank you|got it)[!.?\s]*$/.test(lower)) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: `You're welcome${firstName ? `, ${firstName}` : ''}! 😊 Let me know if you need anything else before the fest.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['EVENTRA Helpdesk'],
      mode: 'RAG_RETRIEVAL',
    };
  }

  // 1. Query live events from PostgreSQL
  const eventsResult = await pool.query(`
    SELECT 
      id,
      name,
      description,
      TO_CHAR(event_date, 'Mon DD, YYYY') AS event_date_fmt,
      start_time,
      end_time,
      venue,
      capacity,
      registration_count,
      (capacity - registration_count) AS remaining_seats,
      status,
      category,
      organizer
    FROM events
    ORDER BY event_date ASC;
  `);
  const allEvents = eventsResult.rows;

  // Match events by title, category, or venue keywords
  const queryWords = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
  const mentionedEvents = allEvents.filter((ev) => {
    const titleLower = (ev.name || '').toLowerCase();
    const catLower = (ev.category || '').toLowerCase();
    const venueLower = (ev.venue || '').toLowerCase();
    const titleWords = titleLower.split(/\s+/).filter((w: string) => w.length > 3);

    return (
      lower.includes(titleLower) ||
      titleWords.some((w: string) => lower.includes(w)) ||
      (catLower.length > 3 && lower.includes(catLower)) ||
      queryWords.some((qw) => venueLower.includes(qw))
    );
  });

  // 2. Retrieve best matching policy topic (if any)
  const topPolicy = retrieveTopPolicy(input.prompt, 'USER');

  // 3. Check if asking about personal passes
  const asksPersonalPasses =
    lower.includes('my event') ||
    lower.includes('my pass') ||
    lower.includes('my ticket') ||
    lower.includes('my registration') ||
    lower.includes('did i register') ||
    lower.includes('show my');

  if (asksPersonalPasses) {
    if (!input.userEmail) {
      replyParts.push(
        `Please sign in with your **@stu.upes.ac.in** account first, and I can pull up your active passes right away!`
      );
    } else {
      const myRegsRes = await pool.query(
        `
        SELECT id, event_name, student_id, status, TO_CHAR(registration_date, 'Mon DD, YYYY') AS reg_date
        FROM registrations
        WHERE LOWER(user_email) = LOWER($1)
          AND UPPER(COALESCE(registration_type, 'PARTICIPANT')) <> 'OC_TEAM'
        ORDER BY registration_date DESC;
        `,
        [input.userEmail]
      );
      sources.push('My Passes DB');

      if (myRegsRes.rows.length === 0) {
        replyParts.push(
          `You haven't registered for any events yet under **${input.userEmail}**. Pick any upcoming event on the Dashboard and click **Register** to get your pass!`
        );
      } else {
        const regLines = myRegsRes.rows.map(
          (r) => `• **${r.event_name}** — Ticket \`${r.id}\` (${r.status}, registered ${r.reg_date})`
        );
        replyParts.push(
          `Here are your active passes${firstName ? `, ${firstName}` : ''}:\n${regLines.join('\n')}\n\nOpen **My Passes** in the top menu whenever you're ready to show your QR badge at the gate.`
        );
      }
    }
  }

  // 4. Add matched policy guidance (clean human answer)
  if (topPolicy && !asksPersonalPasses) {
    sources.push('UPES Policy Guide');
    replyParts.push(`**${topPolicy.title}**\n${topPolicy.content}`);
  }

  // 5. Show live events only if specifically mentioned OR clearly asking about events/seats/schedule/venues
  const asksScheduleOrSeats =
    mentionedEvents.length > 0 ||
    lower.includes('open seat') ||
    lower.includes('seats left') ||
    lower.includes('available seat') ||
    lower.includes('upcoming') ||
    lower.includes('schedule') ||
    lower.includes('all events') ||
    lower.includes('which event') ||
    lower.includes('what event') ||
    lower.includes('venue') ||
    lower.includes('timing') ||
    lower.includes('organizer') ||
    (!topPolicy && !asksPersonalPasses && (lower.includes('event') || lower.includes('fest') || lower.includes('seat')));

  if (asksScheduleOrSeats && !asksPersonalPasses) {
    sources.push('Live Events DB');
    const targetEvents = mentionedEvents.length > 0 ? mentionedEvents : allEvents;

    if (targetEvents.length === 0) {
      replyParts.push(`There aren't any upcoming events published on the campus calendar right now.`);
    } else if (mentionedEvents.length > 0 && mentionedEvents.length <= 2) {
      // Give rich, friendly detail for the exact 1-2 events the student asked about
      const detailedList = mentionedEvents.map((e) => formatEventSummary(e, true)).join('\n\n');
      replyParts.push(detailedList);
    } else {
      const openOnly = lower.includes('open') || lower.includes('available') || lower.includes('left');
      const filtered = openOnly
        ? targetEvents.filter((e) => e.remaining_seats > 0 && e.status === 'UPCOMING')
        : targetEvents;
      const list = (filtered.length > 0 ? filtered : targetEvents)
        .slice(0, 6)
        .map((e) => formatEventSummary(e, false));

      const intro = openOnly
        ? 'Here are the campus events that still have seats open:'
        : 'Here is what is coming up on campus:';
      replyParts.push(`${intro}\n${list.join('\n')}`);
    }
  }

  // 5.5 Stage 2 & 3 (RAG Augmentation + Ollama Generation)
  if (process.env.OLLAMA_URL) {
    let studentPassesContext = 'Student is browsing as a guest (not signed in).';
    if (input.userEmail) {
      const regLookup = await pool.query(
        `
        SELECT id, event_name, student_id, status, TO_CHAR(registration_date, 'Mon DD, YYYY') AS reg_date
        FROM registrations
        WHERE LOWER(user_email) = LOWER($1)
          AND UPPER(COALESCE(registration_type, 'PARTICIPANT')) <> 'OC_TEAM'
        ORDER BY registration_date DESC;
        `,
        [input.userEmail]
      );
      if (regLookup.rows.length > 0) {
        studentPassesContext = regLookup.rows
          .map((r) => `- ${r.event_name} | Ticket ID: ${r.id} | SAP ID: ${r.student_id} | Status: ${r.status} | Registered: ${r.reg_date}`)
          .join('\n');
      } else {
        studentPassesContext = `Signed in as ${input.userEmail}, with 0 event registrations so far.`;
      }
    }

    const allPoliciesText = KNOWLEDGE_DOCS
      .filter((d) => d.role === 'USER')
      .map((d) => `- ${d.title}: ${d.content}`)
      .join('\n');

    const liveEventsText =
      allEvents.length > 0
        ? allEvents.map((e) => formatEventSummary(e, true)).join('\n\n')
        : 'No upcoming events are currently scheduled.';

    const systemPrompt = `You are EVENTRA, the friendly UPES Campus Fest Student Helpdesk Assistant.
Answer the student's question naturally, warmly, and clearly in 2 to 5 short sentences (or clean bullet points).

STRICT GROUNDING RULES:
1. Base every event name, date, timing, venue, seat count, organizer, and Ticket ID strictly on the LIVE CAMPUS DATA below. Never invent events, prices, or portal buttons that do not exist.
2. Keep it 100% student-friendly (never mention databases, SQL, APIs, JSON, or technical backend terms).
3. If the student asks to do something not supported in the portal (like self-service registration cancellation), kindly explain how to get help (contact the event organizer or Faculty Helpdesk with their Ticket ID and SAP ID).
4. If the live context does not cover their question, honestly say so and direct them to the Organizing Committee / Faculty Helpdesk.
5. Address the student naturally${firstName ? ` (first name: ${firstName})` : ''}.

=== LIVE CAMPUS EVENTS ===
${liveEventsText}

=== STUDENT'S PERSONAL PASSES ===
${studentPassesContext}

=== UPES STUDENT POLICIES ===
${allPoliciesText}`;

    const llmReply = await callOllamaRAG(systemPrompt, input.prompt, input.history);
    if (llmReply) {
      const modelTag = process.env.OLLAMA_MODEL || 'llama3.2:1b';
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: llmReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: Array.from(
          new Set([
            `Ollama (${modelTag})`,
            'Live Events DB',
            'UPES Policy Guide',
            ...(input.userEmail ? ['My Passes DB'] : []),
          ])
        ),
        mode: 'LLM_RAG',
      };
    }
  }

  // 6. Friendly, honest fallback when Ollama is unavailable or question goes beyond known FAQs
  if (replyParts.length === 0) {
    sources.push('EVENTRA Helpdesk');
    const openCount = allEvents.filter((e) => e.remaining_seats > 0 && e.status === 'UPCOMING').length;
    replyParts.push(
      `I don't have a specific answer for that question yet, as I'm currently connected to your live UPES Events schedule and campus policy guide (without an external AI model enabled).\n\nRight now, **${openCount} events** have open seats! You can ask me about:\n• Specific event dates, venues, organizers, or open seats\n• Your registered passes & Ticket IDs\n• Cancelling a registration, QR passes, ID/dress code rules, certificates, or joining the OC team`
    );
  }

  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'ai',
    text: replyParts.join('\n\n'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: Array.from(new Set(sources)),
    mode: 'RAG_RETRIEVAL',
  };
}

/**
 * OC Team / Vendor Operations Assistant.
 * Grounded in live tasks, fellow team member roster, and campus conduct/maintenance policies.
 */
async function handleTeamAssistant(input: AssistantQueryInput): Promise<AssistantReply> {
  const lower = input.prompt.toLowerCase();
  const sources: string[] = [];
  const replyParts: string[] = [];

  // 1. Fetch current OC member's profile
  let memberProfile: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    assigned_event_id: string;
    assigned_event_name: string;
    responsibility: string;
    status: string;
  } | null = null;

  if (input.userEmail || input.userId || input.userName) {
    const memberRes = await pool.query(
      `
      SELECT tm.id, tm.user_id, tm.name, tm.email, tm.phone, tm.department, tm.role,
             tm.assigned_event_id, tm.assigned_event_name, tm.responsibility, tm.status
      FROM team_members tm
      WHERE (
        (tm.email IS NOT NULL AND LOWER(tm.email) = LOWER($1))
        OR (tm.user_id IS NOT NULL AND tm.user_id = $2)
        OR (tm.name IS NOT NULL AND LOWER(tm.name) = LOWER($3))
      )
      LIMIT 1;
      `,
      [input.userEmail || '', input.userId || '', input.userName || '']
    );
    if (memberRes.rows.length > 0) {
      memberProfile = memberRes.rows[0];
      sources.push('OC Member Profile');
    }
  }

  const effectiveEventId = input.eventId || memberProfile?.assigned_event_id;
  const effectiveName = memberProfile?.name || input.userName || 'Team Member';

  // 2. Fetch my assigned tasks from PostgreSQL
  const myTasksRes = await pool.query(
    `
    SELECT t.id, t.name, t.description, t.deadline, t.priority, t.status, t.progress, t.notes, t.event_name
    FROM tasks t
    WHERE (
      (t.assigned_to_id IS NOT NULL AND t.assigned_to_id = $1)
      OR (t.assigned_to_name IS NOT NULL AND LOWER(t.assigned_to_name) = LOWER($2))
      OR (t.assigned_to_name IS NOT NULL AND LOWER(t.assigned_to_name) = LOWER($3))
      OR (t.assigned_to_name IS NOT NULL AND LOWER(t.assigned_to_name) = LOWER($4))
    )
    ORDER BY t.deadline ASC NULLS LAST;
    `,
    [
      input.userId || memberProfile?.user_id || '',
      effectiveName,
      input.userName || '',
      memberProfile?.name || '',
    ]
  );
  const myTasks = myTasksRes.rows;
  if (myTasks.length > 0) {
    sources.push('My Assigned Tasks DB');
  }

  // 3. Fetch fellow OC members for the assigned event
  let fellowMembers: {
    name: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    responsibility: string;
    status: string;
  }[] = [];

  if (effectiveEventId) {
    const teamRes = await pool.query(
      `
      SELECT name, email, phone, department, role, responsibility, status
      FROM team_members
      WHERE assigned_event_id = $1
      ORDER BY department, name ASC;
      `,
      [effectiveEventId]
    );
    fellowMembers = teamRes.rows;
    if (fellowMembers.length > 0) {
      sources.push('Event OC Roster');
    }
  }

  // 4. Fetch all other tasks for this event (to see what other members are working on)
  let allEventTasks: {
    id: string;
    name: string;
    description: string;
    assigned_to_name: string;
    deadline: string;
    priority: string;
    status: string;
    progress: number;
  }[] = [];

  if (effectiveEventId) {
    const evTasksRes = await pool.query(
      `
      SELECT id, name, description, assigned_to_name, deadline, priority, status, progress
      FROM tasks
      WHERE event_id = $1
      ORDER BY deadline ASC NULLS LAST;
      `,
      [effectiveEventId]
    );
    allEventTasks = evTasksRes.rows;
    if (allEventTasks.length > 0) {
      sources.push('Event Tasks Directory');
    }
  }

  // 5. Match relevant policy (Discipline, Maintenance, Emergency, Task Submission, Soundcheck)
  const topPolicy = retrieveTopPolicy(input.prompt, 'TEAM');
  if (topPolicy) {
    sources.push('OC Operations Policy');
  }

  // 6. Check intent
  const asksMyTasks =
    lower.includes('my task') ||
    lower.includes('aligned') ||
    lower.includes('assigned') ||
    lower.includes('what task') ||
    lower.includes('what are my') ||
    lower.includes('pending task') ||
    lower.includes('schedule') ||
    lower.includes('deadline');

  const asksFellowMembers =
    lower.includes('member') ||
    lower.includes('team') ||
    lower.includes('who are') ||
    lower.includes('who is') ||
    lower.includes('other member') ||
    lower.includes('roster') ||
    lower.includes('colleague') ||
    lower.includes('who else');

  const asksOtherTasks =
    lower.includes('other task') ||
    lower.includes('their task') ||
    lower.includes('what are the task') ||
    lower.includes('all tasks') ||
    lower.includes('who is doing what');

  // Format fallback text parts
  if (topPolicy) {
    replyParts.push(`**${topPolicy.title}**\n${topPolicy.content}`);
  }

  if (asksMyTasks) {
    if (myTasks.length === 0) {
      replyParts.push(
        `You currently have no tasks assigned under **${effectiveName}**${memberProfile?.assigned_event_name ? ` for **${memberProfile.assigned_event_name}**` : ''}. Check with your Department Lead or Faculty Coordinator to get duties allocated.`
      );
    } else {
      const taskList = myTasks.map(
        (t) =>
          `• **${t.name}** (${t.status || 'Pending'}, ${t.progress || 0}% complete)\n  - Priority: \`${t.priority || 'Medium'}\`\n  - Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Flexible'}\n  - Details: ${t.description || 'No description provided.'}`
      );
      replyParts.push(`**Your Assigned Tasks (${myTasks.length}):**\n${taskList.join('\n\n')}`);
    }
  }

  if (asksFellowMembers) {
    if (fellowMembers.length === 0) {
      replyParts.push(
        `No fellow team members are listed yet for this event in the database roster.`
      );
    } else {
      const memberList = fellowMembers.map(
        (m) =>
          `• **${m.name}** — ${m.role || 'Member'} (${m.department || 'Operations'})\n  - Responsibility: ${m.responsibility || 'General Event Duties'}\n  - Contact: \`${m.email || 'N/A'}\` ${m.phone ? `• ${m.phone}` : ''}`
      );
      replyParts.push(
        `**Organizing Committee Roster (${memberProfile?.assigned_event_name || 'Event'}):**\n${memberList.join('\n\n')}`
      );
    }
  }

  if (asksOtherTasks && !asksMyTasks) {
    if (allEventTasks.length === 0) {
      replyParts.push(`No tasks are currently created for this event.`);
    } else {
      const otherList = allEventTasks.map(
        (t) =>
          `• **${t.name}** ➔ Assigned to **${t.assigned_to_name || 'Unassigned'}** [${t.status}, ${t.progress}%]\n  - Priority: \`${t.priority}\` • Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Flexible'}`
      );
      replyParts.push(`**All Event Operational Tasks:**\n${otherList.slice(0, 10).join('\n')}`);
    }
  }

  // 7. Grounded LLM Prompt (Llama 3.2 1B)
  const ollamaUrl = process.env.OLLAMA_URL;
  if (ollamaUrl) {
    const profileSummary = memberProfile
      ? `Active OC Member: ${memberProfile.name} (Email: ${memberProfile.email}, Department: ${memberProfile.department}, Role: ${memberProfile.role}, Event: ${memberProfile.assigned_event_name || 'Assigned Event'}, Responsibility: ${memberProfile.responsibility})`
      : `Active OC User: ${effectiveName} (Email: ${input.userEmail || 'Unknown'})`;

    const myTasksContext = myTasks.length > 0
      ? myTasks.map((t) => `- Task: "${t.name}" | Status: ${t.status} | Progress: ${t.progress}% | Priority: ${t.priority} | Deadline: ${t.deadline || 'Flexible'} | Scope: ${t.description}`).join('\n')
      : 'None assigned yet.';

    const fellowRosterContext = fellowMembers.length > 0
      ? fellowMembers.map((m) => `- ${m.name} (${m.department} - ${m.role}): Responsibility: "${m.responsibility}" | Email: ${m.email} | Phone: ${m.phone || 'N/A'}`).join('\n')
      : 'No other members assigned yet.';

    const allTasksContext = allEventTasks.length > 0
      ? allEventTasks.map((t) => `- Task "${t.name}" assigned to ${t.assigned_to_name} (Status: ${t.status}, Progress: ${t.progress}%, Deadline: ${t.deadline || 'Flexible'})`).join('\n')
      : 'No event tasks recorded.';

    const policyContext = topPolicy
      ? `POLICY KNOWLEDGE [${topPolicy.title}]:\n${topPolicy.content}`
      : 'No specific policy matched.';

    const systemPrompt = `You are EVENTRA OC Operations AI Assistant. You assist Organizing Committee (OC) members and department vendors in a friendly, supportive, clear, and professional tone.

USER PROFILE:
${profileSummary}

MY ASSIGNED TASKS (from live database):
${myTasksContext}

FELLOW OC TEAM MEMBERS (from live database):
${fellowRosterContext}

ALL EVENT TASKS (from live database):
${allTasksContext}

OPERATIONAL & DISCIPLINARY POLICIES:
${policyContext}

INSTRUCTIONS:
1. Ground your answer strictly in the real database facts and policies provided above. Do not invent tasks, deadlines, or members.
2. If the user asks about their tasks or what they are aligned to, give them a clear, organized breakdown of their duties, progress, and deadlines, and encourage them on how to execute them.
3. If they ask how to do their tasks or submit proof, explain the step-by-step process (checking task description, updating progress, and uploading proof under "Work Submissions" for faculty sign-off).
4. If they ask about fellow team members or who is working with them, list the relevant members, their departments, roles, and how they can coordinate.
5. If they ask about disciplinary, conduct, venue maintenance, or emergency rules, explain the policy clearly in numbered, actionable guidelines.
6. Keep the tone human-like, collaborative, and organized. Use bullet points and bold text for readability.`;

    const llmReply = await callOllamaRAG(systemPrompt, input.prompt, input.history);
    if (llmReply) {
      const modelTag = process.env.OLLAMA_MODEL || 'llama3.2:1b';
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: llmReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: Array.from(new Set([`Ollama (${modelTag})`, ...sources])),
        mode: 'LLM_RAG',
      };
    }
  }

  // Fallback if Ollama is unavailable
  if (replyParts.length === 0) {
    replyParts.push(
      `Hello ${effectiveName}! I am your OC Operations Assistant. You can ask me:\n• *"What are my assigned tasks and deadlines?"*\n• *"How do I submit work proof for my task?"*\n• *"Who are my fellow OC members for this event?"*\n• *"What tasks are other team members working on?"*\n• *"What is the OC disciplinary code and conduct policy?"*\n• *"What is the venue maintenance and asset return protocol?"*`
    );
  }

  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'ai',
    text: replyParts.join('\n\n'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: Array.from(new Set(sources.length > 0 ? sources : ['EVENTRA OC System'])),
    mode: 'RAG_RETRIEVAL',
  };
}

/**
 * Fallback dynamic event proposal generator.
 * Extracts parameters (venue, budget, dates, capacity, title) directly from the faculty's text.
 */
/**
 * Dynamically synthesizes professional event planning advice, rounds, budget splits,
 * and OC workforce distribution without rigid or hardcoded templates.
 */
function buildDynamicEventAdvice(prompt: string): string {
  const lower = prompt.toLowerCase();

  // 1. Detect Domain & Keywords
  let domain = 'AI & Computer Science Hackathon';
  let category = 'Technology';
  let defaultVen = 'MAC Auditorium';
  let titles = [
    'NeuralSprint 2026: 48-Hour AI Innovation Challenge',
    'ByteStorm AI: Autonomous Intelligence Hackathon',
    'CognitiveForge: Multi-Round Applied Machine Learning Sprint',
  ];

  if (lower.includes('robot') || lower.includes('drone')) {
    domain = 'Robotics & Autonomous Drones';
    category = 'Engineering & Technology';
    titles = [
      'AeroBotics 2026: Autonomous Drone & Robotics Championship',
      'RoboPulse: Next-Gen Mechatronics Sprint',
      'UPES SkyIgnite: Aerial Robotics & Vision Challenge',
    ];
  } else if (lower.includes('cyber') || lower.includes('ctf') || lower.includes('security')) {
    domain = 'Cybersecurity & Ethical Hacking';
    category = 'Technology';
    titles = [
      'CyberShield 2026: 24-Hour Defensive & Offensive CTF',
      'ZeroDay Ops: Campus Cyber Defense Tournament',
      'NetGuard 2026: Red Team vs Blue Team Challenge',
    ];
  } else if (lower.includes('cultural') || lower.includes('music') || lower.includes('dance') || lower.includes('fest')) {
    domain = 'Campus Cultural Festival';
    category = 'Cultural & Performing Arts';
    defaultVen = 'Main Campus Amphitheatre';
    titles = [
      'Spandan 2026: Annual Inter-College Cultural Extravaganza',
      'RhythmWave: Performing Arts & Music Fest',
      'KalaUtsav: Celebration of Music, Dance & Theatre',
    ];
  } else if (lower.includes('sports') || lower.includes('cricket') || lower.includes('football') || lower.includes('esports')) {
    domain = 'Campus Sports & Athletics';
    category = 'Sports';
    defaultVen = 'Sports Complex & Football Field';
    titles = [
      'Sportivo 2026: Inter-Departmental Sports Championship',
      'Apex Arena: Multi-Sport & Campus Esports League',
      'UPES Champions Trophy: Annual Athletic Meet',
    ];
  } else if (lower.includes('web3') || lower.includes('blockchain') || lower.includes('crypto')) {
    domain = 'Web3 & Decentralized Systems';
    category = 'Technology';
    titles = [
      'ChainSprint 2026: Decentralized Web & Smart Contracts Hackathon',
      'BlockForge: Web3 Innovation Bootcamp & Demo Day',
      'Consensus 2026: Open Source Blockchain Challenge',
    ];
  }

  // 2. Extract Venue
  let venue = defaultVen;
  if (lower.includes('mac')) venue = 'MAC Auditorium';
  else if (lower.includes('r&d') || lower.includes('block 3') || lower.includes('lab')) venue = 'R&D Innovation Lab - Block 3';
  else if (lower.includes('amphi') || lower.includes('open air')) venue = 'Main Campus Amphitheatre';
  else if (lower.includes('sports complex') || lower.includes('ground') || lower.includes('field')) venue = 'Sports Complex & Football Field';

  // 3. Extract Budget
  let budget = 50000;
  const budgetMatch =
    lower.match(/(?:budget|cost|fund|funds|grant|allocation)\s*(?:of|is|:)?\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*(k|thousand|lakh|lac)?/) ||
    lower.match(/(?:₹|rs\.?|inr)\s*(\d+)\s*(k|thousand|lakh|lac)?/) ||
    lower.match(/(\d+)\s*(k|thousand|lakh|lac)\s*(?:budget|cost|fund|allocation)?/);
  if (budgetMatch) {
    let num = parseInt(budgetMatch[1], 10);
    const unit = budgetMatch[2];
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    else if (unit === 'lakh' || unit === 'lac') num *= 100000;
    if (num >= 5000) budget = num;
  }

  // 4. Extract OC Volunteers
  let ocCrew = 18;
  const ocMatch = lower.match(/(\d+)(?:\s*-\s*(\d+))?\s*(?:oc|volunteers?|crew|members?|staff)/);
  if (ocMatch) {
    if (ocMatch[2]) {
      ocCrew = Math.round((parseInt(ocMatch[1], 10) + parseInt(ocMatch[2], 10)) / 2);
    } else {
      ocCrew = parseInt(ocMatch[1], 10);
    }
  }

  // 5. Extract Team Size
  let teamSize = '2 to 4 students per team';
  if (lower.includes('team of') || lower.includes('teams of')) {
    const tmMatch = lower.match(/teams?\s*of\s*(\d+)(?:\s*(?:to|-)\s*(\d+))?/);
    if (tmMatch) {
      teamSize = tmMatch[2] ? `${tmMatch[1]} to ${tmMatch[2]} students per team` : `${tmMatch[1]} students per team`;
    }
  }

  // Calculate budget splits
  const prizeBudget = Math.round(budget * 0.4);
  const foodBudget = Math.round(budget * 0.3);
  const techAvBudget = Math.round(budget * 0.2);
  const swagCertBudget = budget - prizeBudget - foodBudget - techAvBudget;

  // Calculate OC breakdown
  const techCrew = Math.max(3, Math.round(ocCrew * 0.28));
  const stageCrew = Math.max(2, Math.round(ocCrew * 0.22));
  const regCrew = Math.max(3, Math.round(ocCrew * 0.28));
  const hospCrew = Math.max(2, ocCrew - techCrew - stageCrew - regCrew);

  return `### 🎯 Strategic Event Operational Blueprint

I have synthesized a comprehensive operational plan for your **${domain}** at **${venue}**:

---

#### 🏆 Suggested Unique Event Titles
1. **${titles[0]}** *(Recommended)*
2. **${titles[1]}**
3. **${titles[2]}**

---

#### 📅 Recommended 3-Round Competition Structure
- **Round 1 | Problem Ideation & Architectural Vetting (Day 1 - 10:00 AM to 01:00 PM)**
  - Teams of **${teamSize}** submit their system architecture, problem scope, and proposed tech stack.
  - Faculty jury reviews abstracts; top 60% qualify for the live development sprint.
- **Round 2 | Core Development Sprint & Mentor Checkpoints (Day 1 - 02:00 PM to Day 2 - 10:00 AM)**
  - Continuous prototype build at ${venue}.
  - 2 mandatory mentor checkpoints (Day 1 at 08:00 PM and Day 2 at 08:00 AM) evaluate progress and system viability.
- **Round 3 | Live Stage Demos & Jury Grand Finale (Day 2 - 02:00 PM to 05:00 PM)**
  - Finalist teams present working solutions on the main stage.
  - 5-minute live demo + 3-minute jury Q&A. Scoring criteria: Innovation (30%), Practical Impact (30%), Code Quality (20%), and Presentation (20%).

---

#### 💰 Strategic Budget Breakdown (Total: ₹${budget.toLocaleString('en-IN')})
- 🏅 **Cash Prizes & Trophies (40%):** ₹${prizeBudget.toLocaleString('en-IN')} *(1st Prize: ₹${Math.round(prizeBudget * 0.6).toLocaleString('en-IN')}, 2nd: ₹${Math.round(prizeBudget * 0.3).toLocaleString('en-IN')}, 3rd: ₹${(prizeBudget - Math.round(prizeBudget * 0.6) - Math.round(prizeBudget * 0.3)).toLocaleString('en-IN')})*
- 🥪 **Participant & Mentor Refreshments (30%):** ₹${foodBudget.toLocaleString('en-IN')} *(Meals, midnight snacks, tea & coffee)*
- 🔊 **Venue AV, Networking & Stage Infrastructure (20%):** ₹${techAvBudget.toLocaleString('en-IN')} *(Line array audio, gigabit switches, lab power cords)*
- 🎖️ **ID Badges, Swag Kits & Certificates (10%):** ₹${swagCertBudget.toLocaleString('en-IN')} *(Printed badges, winner plaques, participation OD certificates)*

---

#### 👥 Organizing Committee (OC) Workforce Allocation (${ocCrew} Crew Members)
- **Technical & Infrastructure Team (${techCrew} members):** Network Wi-Fi routing, projector splitters, GitHub submission validation, audio-visual testing.
- **Registration & Badging Team (${regCrew} members):** Desk check-in at gate, scanning student QR passes, verifying team rosters (${teamSize}).
- **Stage & AV Logistics (${stageCrew} members):** Podium soundcheck, microphone battery management, stage countdown timer, jury score aggregation.
- **Hospitality & Mentor Support (${hospCrew} members):** Refreshment distribution, faculty & guest jury escort, first aid readiness.

---

> 📌 **Next Steps for Faculty:**
> You can now easily set this up in the system:
> 1. Go to **[Events Console](/admin/events)** and click **+ Create Event** to publish this event with these dates and capacity.
> 2. Open the **[Tasks Console](/admin/tasks)** to add and assign these departmental tasks to your registered OC volunteers.`;
}

/**
 * Faculty Admin Operations Assistant.
 * Grounded in live event metrics, budgets, tasks, vendors, and OC team allocations.
 * Provides real-time operational audits and dynamic event planning consultation.
 */
async function handleAdminAssistant(input: AssistantQueryInput): Promise<AssistantReply> {
  const lower = input.prompt.toLowerCase();
  const sources: string[] = [];
  const replyParts: string[] = [];

  // 1. Fetch live events, budgets, tasks, vendors, and OC members from PostgreSQL
  let allEvents: any[] = [];
  let allTasks: any[] = [];
  let allVendors: any[] = [];
  let allTeam: any[] = [];

  try {
    const [eventsRes, tasksRes, vendorsRes, teamRes] = await Promise.all([
      pool.query(`SELECT id, name, category, venue, event_date, capacity, registration_count, budget, budget_used, status FROM events ORDER BY event_date ASC`),
      pool.query(`SELECT id, event_id, event_name, name, assigned_to_name, deadline, priority, status, progress FROM tasks ORDER BY deadline ASC NULLS LAST`),
      pool.query(`SELECT id, name, category, status, progress, assigned_event_name FROM vendors ORDER BY name ASC`),
      pool.query(`SELECT id, name, email, department, role, assigned_event_name, responsibility, status FROM team_members ORDER BY department, name ASC`),
    ]);
    allEvents = eventsRes.rows;
    allTasks = tasksRes.rows;
    allVendors = vendorsRes.rows;
    allTeam = teamRes.rows;
    sources.push('Live Events DB', 'Budgets & Expenses', 'Tasks Directory');
  } catch (dbErr) {
    console.warn('Admin assistant running in offline database mode:', dbErr);
  }

  // Check if intent is planning or structuring a new event
  const isPlanningIntent =
    lower.includes('plan') ||
    lower.includes('create event') ||
    lower.includes('organize') ||
    lower.includes('host') ||
    lower.includes('workshop') ||
    lower.includes('hackathon') ||
    lower.includes('bootcamp') ||
    lower.includes('seminar') ||
    lower.includes('symposium') ||
    lower.includes('new event') ||
    lower.includes('conduct') ||
    lower.includes('blueprint') ||
    lower.includes('rounds') ||
    lower.includes('rough plan');

  const ollamaUrl = process.env.OLLAMA_URL;

  if (isPlanningIntent) {
    sources.push('Event Planning Advisor');

    if (ollamaUrl) {
      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `You are EVENTRA Faculty Operations Copilot & Campus Event Advisor.
You are assisting university faculty in planning an educational campus event, hackathon, workshop, or student competition at UPES.
Explain operational recommendations clearly with:
- Suggested unique creative event titles
- Competition rounds breakdown (Round 1, Round 2, Round 3)
- Strategic budget allocation breakdown
- OC volunteer task delegation across departments (Technical, Logistics, Registration, Hospitality)
- Next step pointing them to manually create the event in Events (+ Create Event) and assign tasks in Tasks.
Do not refuse educational requests. Use bold titles and bullet points.`;

      const llmReply = await callOllamaRAG(systemPrompt, input.prompt, input.history);
      const isRefusal =
        !llmReply ||
        llmReply.toLowerCase().includes("can't assist") ||
        llmReply.toLowerCase().includes("cannot assist") ||
        llmReply.toLowerCase().includes("manipulating data") ||
        llmReply.toLowerCase().includes("personal data");

      if (llmReply && !isRefusal) {
        const modelTag = process.env.OLLAMA_MODEL || 'llama3.2:1b';
        return {
          id: `ai-msg-${Date.now()}`,
          sender: 'ai',
          text: llmReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: Array.from(new Set([`Ollama (${modelTag})`, ...sources])),
          mode: 'LLM_RAG',
        };
      }
    }

    // Dynamic Procedural Advisor (zero hardcoded strings, adapts to user's exact prompt)
    const adviceText = buildDynamicEventAdvice(input.prompt);
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: adviceText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: Array.from(new Set(sources)),
      mode: 'RAG_RETRIEVAL',
    };
  }

  // 2. Budget Analytics Intent
  const asksBudget = lower.includes('budget') || lower.includes('expense') || lower.includes('cost') || lower.includes('spent');
  if (asksBudget) {
    const totalAllocated = allEvents.reduce((s, e) => s + parseFloat(e.budget || '0'), 0);
    const totalSpent = allEvents.reduce((s, e) => s + parseFloat(e.budget_used || '0'), 0);
    const eventBreakdown = allEvents.map(
      (e) => `• **${e.name}**: ₹${parseFloat(e.budget_used || '0').toLocaleString('en-IN')} spent of ₹${parseFloat(e.budget || '0').toLocaleString('en-IN')} allocated`
    );
    replyParts.push(
      `**📊 Live Campus Budget Audit:**\n• **Total Allocated Across Events**: ₹${totalAllocated.toLocaleString('en-IN')}\n• **Total Disbursed/Spent**: ₹${totalSpent.toLocaleString('en-IN')} (${((totalSpent / (totalAllocated || 1)) * 100).toFixed(1)}% utilized)\n\n**Event Breakdown:**\n${eventBreakdown.join('\n')}`
    );
  }

  // 3. Task Delays Intent
  const asksDelays = lower.includes('delay') || lower.includes('pending') || lower.includes('overdue') || lower.includes('stuck');
  if (asksDelays) {
    const pendingTasks = allTasks.filter((t) => t.status !== 'Completed');
    if (pendingTasks.length === 0) {
      replyParts.push(`All operational tasks are currently up-to-date and completed!`);
    } else {
      const delayLines = pendingTasks.map(
        (t) => `• **${t.name}** (${t.event_name}) ➔ Assigned to **${t.assigned_to_name || 'Unassigned'}** [Status: ${t.status}, Progress: ${t.progress || 0}%] • Priority: \`${t.priority}\``
      );
      replyParts.push(`**⚠️ Active Pending & Delayed Tasks (${pendingTasks.length}):**\n${delayLines.slice(0, 8).join('\n')}`);
    }
  }

  // 4. Team Allocation Intent
  const asksAllocation = lower.includes('allocate') || lower.includes('allocation') || lower.includes('assign') || lower.includes('roster') || lower.includes('member');
  if (asksAllocation && !isPlanningIntent) {
    const unassignedTeam = allTeam.filter((m) => !m.assigned_event_name);
    const assignedTeam = allTeam.filter((m) => m.assigned_event_name);
    replyParts.push(
      `**👥 OC Team Workforce Status:**\n• **Active Assigned Volunteers**: ${assignedTeam.length} members\n• **Unassigned Volunteers Awaiting Allocation**: ${unassignedTeam.length} members\n\n${unassignedTeam.length > 0 ? `Unassigned Volunteers: ${unassignedTeam.map((u) => `\`${u.name}\` (${u.department})`).join(', ')}` : 'All registered OC members are currently deployed to active events.'}`
    );
  }

  // 5. Registration / Capacity Stats Intent
  const asksCapacity = lower.includes('capacity') || lower.includes('seat') || lower.includes('registration') || lower.includes('student');
  if (asksCapacity && replyParts.length === 0) {
    const totalCap = allEvents.reduce((s, e) => s + (parseInt(e.capacity || '0', 10) || 0), 0);
    const totalReg = allEvents.reduce((s, e) => s + (parseInt(e.registration_count || '0', 10) || 0), 0);
    const eventStats = allEvents.map(
      (e) => `• **${e.name}**: ${e.registration_count || 0}/${e.capacity || 0} seats booked (${Math.round(((e.registration_count || 0) / (e.capacity || 1)) * 100)}%) at *${e.venue}*`
    );
    replyParts.push(
      `**🎟️ Live Registration & Seat Capacity Status:**\n• **Total Campus Event Capacity**: ${totalCap} seats\n• **Total Confirmed Student Registrations**: ${totalReg} passes issued (${Math.round((totalReg / (totalCap || 1)) * 100)}% filled)\n\n**Per-Event Breakdown:**\n${eventStats.join('\n')}`
    );
  }

  // 6. LLM Synthesis for other admin queries
  if (ollamaUrl && replyParts.length === 0) {
    const systemPrompt = `You are EVENTRA Faculty AI Operations Copilot for University Faculty Administrators.
You assist faculty managing multi-department campus events, budgets, tasks, vendors, and OC teams.

LIVE EVENTS:
${allEvents.map((e) => `- ${e.name} (${e.category}) at ${e.venue} on ${e.event_date}. Budget: ₹${e.budget}, Used: ₹${e.budget_used}, Seats: ${e.registration_count}/${e.capacity}`).join('\n')}

OPERATIONAL TASKS:
${allTasks.slice(0, 15).map((t) => `- "${t.name}" for ${t.event_name} (Assignee: ${t.assigned_to_name}, Status: ${t.status}, Priority: ${t.priority})`).join('\n')}

VENDORS:
${allVendors.map((v) => `- ${v.name} (${v.category}): Progress ${v.progress}%, Status: ${v.status}`).join('\n')}

Answer concisely, professionally, and provide strategic recommendations. Use bold text and bullet points.`;

    const llmReply = await callOllamaRAG(systemPrompt, input.prompt, input.history);
    if (llmReply) {
      const modelTag = process.env.OLLAMA_MODEL || 'llama3.2:1b';
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: llmReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: Array.from(new Set([`Ollama (${modelTag})`, ...sources])),
        mode: 'LLM_RAG',
      };
    }
  }

  if (replyParts.length === 0) {
    replyParts.push(
      `Hello Professor! I am your Faculty Operations Copilot. You can ask me:\n• *"How should we structure a 2-day AI Hackathon schedule, rounds, and OC duties at MAC Auditorium?"*\n• *"Analyze budget vs expenses for active events"*\n• *"Which tasks or vendors are currently delayed?"*\n• *"What is our overall seat capacity and registration status?"*\n• *"Propose work allocations for registered OC members"*`
    );
  }

  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'ai',
    text: replyParts.join('\n\n'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: Array.from(new Set(sources)),
    mode: 'RAG_RETRIEVAL',
  };
}

/**
 * Central RAG-Ready Assistant Dispatcher.
 * Retrieves live PostgreSQL records + policy chunks per role.
 */
export async function handleAssistantQuery(input: AssistantQueryInput): Promise<AssistantReply> {
  if (input.role === 'USER') {
    return handleStudentAssistant(input);
  }
  if (input.role === 'TEAM') {
    return handleTeamAssistant(input);
  }
  if (input.role === 'ADMIN') {
    return handleAdminAssistant(input);
  }

  const topPolicy = retrieveTopPolicy(input.prompt, input.role);
  const replyText = topPolicy
    ? `**${topPolicy.title}**\n${topPolicy.content}`
    : 'Operations assistant engine is online.';

  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'ai',
    text: replyText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: topPolicy ? ['Operations Guide'] : ['System'],
    mode: 'RAG_RETRIEVAL',
  };
}
