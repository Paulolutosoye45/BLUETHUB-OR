
// import schoolImage from "@/assets/png/School.png";
import type { SchoolInfo } from "@/services";
import { localData } from "@/utils";
import SchoolPlaceholder from "./SchoolPlaceholder";

interface SchoolRefProps {
    children: React.ReactNode;
    className?: string;
    imageClassName?: string;
    contentClassName?: string;
    mode?: "watermark" | "wallpaper"; // new prop
}

function SchoolRef({ children, mode = "watermark", className = "", contentClassName = "" }: SchoolRefProps) {
    const schoolLogo = localData.retrieve("schoolInfo") as SchoolInfo | null;
    // console.log('schoolLogo', schoolLogo?.logoUrl)
    const isWatermark = mode === "watermark";

    return (
        <div
            className={className}
            style={{
                position: "relative",
                minHeight: "100%",
                width: "100%",
                overflow: "hidden",
                isolation: "isolate", // new stacking context so z-index is local
            }}
        >
            {/* ── Layer 1: the school image ── */}
            {isWatermark ? (
    <div
        aria-hidden="true"
        style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "72%",
            maxWidth: 860,
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.15,
            zIndex: 0,
            border: "2px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
            background: "rgba(255, 255, 255, 0.08)",
        }}
    >
        {schoolLogo?.logoUrl ? (
            <img src={schoolLogo.logoUrl} alt="school logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
            <SchoolPlaceholder />
        )}
    </div>
) : (
    <>
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                userSelect: "none",
                opacity: 0.13,
                zIndex: 0,
            }}
        >
            {schoolLogo?.logoUrl ? (
                <img src={schoolLogo.logoUrl} alt="school logo" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", borderRadius: "4px", border: "2px solid rgba(255, 255, 255, 0.3)" }} />
            ) : (
                <SchoolPlaceholder />
            )}
        </div>
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.15) 100%)",
                backdropFilter: "blur(1.5px)",
                WebkitBackdropFilter: "blur(1.5px)",
                zIndex: 1,
                pointerEvents: "none",
            }}
        />
    </>
)}

            {/* ── Layer 3: actual page content ── */}
            <div
                className={contentClassName}
                style={{ position: "relative", zIndex: 2, height: "100%" }}
            >
                {children}
            </div>
        </div>
    );
}


export default SchoolRef
