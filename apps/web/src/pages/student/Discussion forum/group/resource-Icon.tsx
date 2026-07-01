import { FileImage, FileText } from "lucide-react";
import type { Resource } from "./group-detail-panel";

export const ResourceIcon = ({ type }: { type: Resource["type"] }) => {
    if (type === "image") return <FileImage size={18} className="text-blue-400" />;
    return <FileText size={18} className="text-red-400" />;
};