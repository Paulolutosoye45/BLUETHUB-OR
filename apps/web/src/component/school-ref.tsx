
import schoolImage from "@/assets/png/School.png";

interface SchoolRefProps {
  children: React.ReactNode;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  mode?: "watermark" | "wallpaper"; // new prop
}

function SchoolRef({ children, mode = "watermark", className = "", contentClassName = "" }: SchoolRefProps) {
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
                // Watermark: centred, huge, desaturated stamp
                <img
                    src={schoolImage}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "72%",
                        maxWidth: 860,
                        pointerEvents: "none",
                        userSelect: "none",
                        opacity: 0.07,          // near-invisible — present but never loud
                        // filter: "grayscale(100%) contrast(0.8)",
                        zIndex: 0,
                    }}
                />
            ) : (
                // Wallpaper: edge-to-edge cover, stronger desaturation
                <>
                    <img
                        src={schoolImage}
                        alt=""
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                            pointerEvents: "none",
                            userSelect: "none",
                            opacity: 0.13,          // slightly higher since it's diffuse
                            // filter: "grayscale(100%) contrast(0.7) brightness(1.1)",
                            zIndex: 0,
                        }}
                    />
                    {/* ── Layer 2: scrim — kills texture so cards pop cleanly ── */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            // radial fade: edges slightly darker, center clean
                            background: `

              `,
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
