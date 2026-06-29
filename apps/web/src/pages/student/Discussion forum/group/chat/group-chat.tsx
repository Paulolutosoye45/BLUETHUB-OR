import { Image, Paperclip, Pin, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-able";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

export interface SystemEvent {
  id: string;
  type: "system";
  text: string;
  time?: string;
}

 export interface DateDivider {
  id: string;
  type: "date";
  label: string;
}

type ChatItem = Message | SystemEvent | DateDivider;

// ── Mock Data ─────────────────────────────────────────────────────────────────
const PINNED = "Find T10 and S10 of AP: 3, 7, 11, 15, ... — can you solve";

const INITIAL_ITEMS: ChatItem[] = [
  { id: "d1", type: "date", label: "Today — Monday, 25 May 2026" },
  { id: "s1", type: "system", text: "Adaeze created Maths Olympiad Group", time: "09:02 AM" },
  { id: "s2", type: "system", text: "Chidi Uzoma, Ngozi Kalu, Emeka Bello, Taiwo Falade joined" },
  {
    id: "m1", senderId: "cu", senderName: "Chidi Uzoma", senderInitials: "CU",
    senderColor: "bg-purple-500", time: "10:24 AM",
    text: "Hey everyone 👋 glad we're all here. Let's start with the AP question from last week's homework — I'm stuck on finding the nth term formula.",
  },
  {
    id: "m2", senderId: "nk", senderName: "Ngozi Kalu", senderInitials: "NK",
    senderColor: "bg-red-500", time: "10:24 AM",
    text: "Which question exactly? The one with d = 4 or the savings problem?",
  },
  {
    id: "m3", senderId: "cu", senderName: "Chidi Uzoma", senderInitials: "CU",
    senderColor: "bg-purple-500", time: "10:25 AM",
    text: "The one where a = 3 and d = 4. I need to find T10 and S10. I got T10 = 39 but I think that's wrong 😅",
  },
  {
    id: "m4", senderId: "eb", senderName: "Emeka Bello", senderInitials: "EB",
    senderColor: "bg-green-600", time: "11:15 AM",
    text: "Wait — the sequence is 3, 7, 11, 15. So d = 7 − 3 = 4. T10 = 3 + 9×4 = 3 + 36 = 39. Chidi you ARE right! 😄",
    reactions: [{ emoji: "🎉", count: 3 }, { emoji: "👍", count: 1 }],
  },
  {
    id: "m5", senderId: "cu", senderName: "Chidi Uzoma", senderInitials: "CU",
    senderColor: "bg-purple-500", time: "11:20 AM",
    text: "So for S10: S10 = n/2 × (2a + (n−1)d) = 10/2 × (6 + 36) = 5 × 42 = 210. Is that right?",
  },
];

export const ME = "cu";

// ── Helpers ───────────────────────────────────────────────────────────────────
// const isMessage = (item: ChatItem): item is Message => !("type" in item);



// ── Message Bubble ─────────────────────────────────────────────────────────────


// ── Chat Room ─────────────────────────────────────────────────────────────────
interface GroupChatRoomProps {
  groupName?: string;
  subject?: string;
  teacher?: string;
  onBack?: () => void;
}

export default function GroupChatRoom({
  groupName = "Maths Olympiad Prep",
  subject = "Further Maths",
  teacher = "Mr. Fasikay",
  onBack,
}: GroupChatRoomProps) {
  const [items, setItems] = useState<ChatItem[]>(INITIAL_ITEMS);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: ME,
      senderName: "You",
      senderInitials: "AO",
      senderColor: "bg-indigo-500",
      text,
      time: now,
    };
    setItems((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#EDEDF5] rounded-2xl overflow-hidden border border-gray-100">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mr-1">←</button>
        )}
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">📐</div>
        <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#13112E] truncate">{groupName}</p>
          <p className="text-[11px] text-[#9390BC]">{subject} · {teacher}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Pin size={14} className="text-gray-400" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <span className="text-gray-400 text-xs font-bold">⋯</span>
          </button>
        </div>
      </div>

      {/* ── Pinned message ── */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-start gap-2">
        <Pin size={12} className="text-[#292382] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#292382] font-medium leading-relaxed line-clamp-1">
        <span className="font-bold text-chestnut">Pinned:</span> "{PINNED}"
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {items.map((item) => {
          if ("type" in item) {
            if (item.type === "date") {
              return (
                <div key={item.id} className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-[#29238226] " />
                  <span className="text-[10px] text-chestnut font-semibold whitespace-nowrap border border-[#29238226] p-1 rounded-full">{(item as DateDivider).label}</span>
                  <div className="flex-1 h-px bg-[#29238226]" />
                </div>
              );
            }
            if (item.type === "system") {
              return (
                <div key={item.id} className="text-center">
                  <span className="text-[11px] text-chestnut bg-gray-100 rounded-full px-3 py-1 inline-block">
                    {(item as SystemEvent).text}
                    {(item as SystemEvent).time && (
                      <span className="ml-2 text-chestnut">{(item as SystemEvent).time}</span>
                    )}
                  </span>
                </div>
              );
            }
          }
          return <MessageBubble key={item.id} msg={item as Message} />;
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="bg-white border-t border-gray-100 px-3 py-3">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-1 mb-2">
          {[
            { icon: <Smile size={16} />, label: "Emoji" },
            { icon: <Paperclip size={16} />, label: "Attach" },
            { icon: <Image size={16} />, label: "Image" },
            { icon: <Pin size={16} />, label: "Pin" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1 text-gray-400 hover:text-[#4F61E8] transition-colors text-[11px] font-medium"
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message, share a solution, or ask a question..."
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/30 focus:border-[#4F61E8] transition max-h-28 leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-[#4F61E8] flex items-center justify-center disabled:opacity-30 hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}