import { Avatar } from "./avatar";
import { ME, type Message } from "./group-chat";

export function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.senderId === ME;

  return (
    <div className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && <Avatar initials={msg.senderInitials} color={msg.senderColor} />}

      <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (
          <p className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">{msg.senderName}</p>
        )}
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-[#4F61E8] text-white rounded-tr-sm"
              : "bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100"
          }`}
        >
          {msg.text}
        </div>

        {/* Reactions */}
        {msg.reactions && (
          <div className="flex gap-1 mt-1 ml-1">
            {msg.reactions.map((r) => (
              <span
                key={r.emoji}
                className="flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-2 py-0.5 text-xs shadow-sm cursor-pointer hover:bg-gray-50"
              >
                {r.emoji} <span className="text-gray-500 font-medium">{r.count}</span>
              </span>
            ))}
          </div>
        )}

        <p className="text-[10px] text-gray-300 mt-1 mx-1">{msg.time}</p>
      </div>
    </div>
  );
}