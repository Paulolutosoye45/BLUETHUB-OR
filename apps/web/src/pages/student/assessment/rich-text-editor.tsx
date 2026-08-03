import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor = ({ 
  value,
   onChange,
    // placeholder = "Type your answer here...",
     minHeight = 120 }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }: any) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-slate-700",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? "bg-[#4255db] text-white" : "text-slate-500 hover:bg-slate-100"
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold">
          <Bold className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic">
          <Italic className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List">
          <List className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Ordered List">
          <ListOrdered className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[80px]"
        style={{ minHeight }}
      />

    </div>
  );
};

export default RichTextEditor;
