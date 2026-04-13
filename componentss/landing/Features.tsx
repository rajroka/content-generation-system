import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, ImageIcon, Hash, FolderOpen, FlaskConical, Calendar } from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="w-full py-24 px-4 bg-[hsl(200_25%_94%)] dark:bg-[hsl(200_20%_9%)] transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "#169B7F" }}>
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-[#0A2E2E] dark:text-[hsl(200_20%_90%)]">
            Everything you need to post smarter.
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1 — Multi-Platform Publishing (wide, col-span-2) */}
          <div className="md:col-span-2 bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl p-7 flex flex-col gap-4 shadow-[0_2px_20px_rgba(10,46,46,0.05)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#169B7F18", border: "1px solid #169B7F30" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#169B7F" }} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0A2E2E] dark:text-[hsl(200_20%_88%)] mb-1">Multi-Platform Publishing</h3>
              <p className="text-sm text-[#0A2E2E80] dark:text-[hsl(200_10%_58%)] leading-relaxed max-w-sm">
                One dashboard to rule them all. Write once, customize for each platform, and hit publish.
              </p>
            </div>
            {/* Mock dashboard preview */}
            <div className="mt-2 rounded-xl overflow-hidden border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] bg-[#f0f4f8] dark:bg-[hsl(200_20%_11%)] p-4 flex gap-3">
              {["Facebook", "Instagram", "LinkedIn"].map((p) => (
                <div key={p} className="flex-1 bg-white dark:bg-[hsl(200_15%_18%)] rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                  <div className="h-2 w-2/3 rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)]" />
                  <div className="h-2 w-full rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)]" />
                  <div className="h-2 w-4/5 rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)]" />
                  <p className="text-[10px] font-medium mt-1" style={{ color: "#169B7F" }}>{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2 — Smart Auto-Scheduler */}
          <div className="bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl p-7 flex flex-col gap-4 shadow-[0_2px_20px_rgba(10,46,46,0.05)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#169B7F18", border: "1px solid #169B7F30" }}>
              <Calendar className="w-4 h-4" style={{ color: "#169B7F" }} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0A2E2E] dark:text-[hsl(200_20%_88%)] mb-1">Smart Auto-Scheduler</h3>
              <p className="text-sm text-[#0A2E2E80] dark:text-[hsl(200_10%_58%)] leading-relaxed">
                Our AI suggests the exact minute your followers are most active.
              </p>
            </div>
            {/* Day pills */}
            <div className="flex gap-2 mt-auto">
              {["MON", "TUE", "WED"].map((d, i) => (
                <div
                  key={d}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-semibold"
                  style={
                    i === 0
                      ? { background: "#169B7F", color: "#fff" }
                      : { background: "#f0f4f8", color: "#0A2E2E80" }
                  }
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* 3 — AI Caption Gen */}
          <div className="bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl p-7 flex flex-col gap-3 shadow-[0_2px_20px_rgba(10,46,46,0.05)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#169B7F18", border: "1px solid #169B7F30" }}>
              <Zap className="w-4 h-4" style={{ color: "#169B7F" }} />
            </div>
            <h3 className="font-bold text-base text-[#0A2E2E] dark:text-[hsl(200_20%_88%)]">AI Caption Gen</h3>
            <p className="text-sm text-[#0A2E2E80] dark:text-[hsl(200_10%_58%)] leading-relaxed">
              Professional captions tailored to your brand voice using our fine-tuned model.
            </p>
          </div>

          {/* 4 — Hashtag Suggestions */}
          <div className="bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl p-7 flex flex-col gap-3 shadow-[0_2px_20px_rgba(10,46,46,0.05)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#169B7F18", border: "1px solid #169B7F30" }}>
              <Hash className="w-4 h-4" style={{ color: "#169B7F" }} />
            </div>
            <h3 className="font-bold text-base text-[#0A2E2E] dark:text-[hsl(200_20%_88%)]">Hashtag Suggestions</h3>
            <p className="text-sm text-[#0A2E2E80] dark:text-[hsl(200_10%_58%)] leading-relaxed">
              Trending and relevant tags for maximum reach — broad, niche, and Reels mix.
            </p>
          </div>

          {/* 5 — Image Upload */}
          <div className="bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl p-7 flex flex-col gap-3 shadow-[0_2px_20px_rgba(10,46,46,0.05)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#169B7F18", border: "1px solid #169B7F30" }}>
              <ImageIcon className="w-4 h-4" style={{ color: "#169B7F" }} />
            </div>
            <h3 className="font-bold text-base text-[#0A2E2E] dark:text-[hsl(200_20%_88%)]">Image Generation</h3>
            <p className="text-sm text-[#0A2E2E80] dark:text-[hsl(200_10%_58%)] leading-relaxed">
              Generate visuals with DALL-E 3 or upload your own. Direct assets library, simple drag-and-drop.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}














// import { PenLine, Calendar, Hash, FolderOpen, Cpu, Upload } from "lucide-react";

// /* ─── Mini compose window illustration ─────────────────────────────── */
// function PublishIllustration() {
//   return (
//     <div className="mt-4 rounded-xl overflow-hidden border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] bg-[#eef4f7] dark:bg-[hsl(200_18%_11%)] p-4 select-none">
//       {/* Compose window */}
//       <div className="bg-white dark:bg-[hsl(200_15%_16%)] rounded-xl border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] p-4 mb-3">
//         {/* browser dots */}
//         <div className="flex items-center gap-1.5 mb-3">
//           <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
//           <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
//           <div className="w-2 h-2 rounded-full bg-[#28c840]" />
//         </div>
//         {/* skeleton lines */}
//         <div className="space-y-2">
//           <div className="h-2.5 rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)] w-full" />
//           <div className="h-2.5 rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)] w-4/5" />
//           <div className="h-2.5 rounded-full bg-[#e8eef2] dark:bg-[hsl(200_15%_25%)] w-3/5" />
//         </div>
//         {/* image drop zone */}
//         <div className="mt-3 h-14 rounded-lg bg-[#f0f9f8] dark:bg-[hsl(200_18%_13%)] border border-dashed border-[#169B7F40] flex items-center justify-center gap-2">
//           <Upload className="w-3.5 h-3.5" style={{ color: "#169B7F" }} strokeWidth={1.75} />
//           <span className="text-[11px] font-medium" style={{ color: "#169B7F" }}>Drop image here</span>
//         </div>
//       </div>

//       {/* Publishing channel pills */}
//       <div className="flex flex-wrap gap-2">
//         {[
//           { label: "Facebook", bg: "#1877F2" },
//           { label: "Instagram", bg: "#E1306C" },
//           { label: "LinkedIn", bg: "#0A66C2" },
//           { label: "X / Twitter", bg: "#14171A" },
//         ].map(({ label, bg }) => (
//           <div
//             key={label}
//             className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
//             style={{ background: bg }}
//           >
//             <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
//             {label}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ─── Scheduler illustration ────────────────────────────────────────── */
// function SchedulerIllustration() {
//   return (
//     <div className="mt-auto pt-5">
//       <div className="flex gap-1.5">
//         {["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => (
//           <div
//             key={d}
//             className="flex-1 py-2 rounded-lg text-[10px] font-bold text-center"
//             style={
//               i === 0
//                 ? { background: "#169B7F", color: "#fff" }
//                 : { background: "rgba(10,46,46,0.06)", color: "rgba(10,46,46,0.45)" }
//             }
//           >
//             {d}
//           </div>
//         ))}
//       </div>
//       <div className="mt-2.5 bg-[#f0f9f8] dark:bg-[hsl(200_18%_11%)] rounded-lg px-3 py-2 flex items-center gap-2 border border-[#169B7F20]">
//         <span className="w-2 h-2 rounded-full bg-[#169B7F] animate-pulse shrink-0" />
//         <span className="text-[11px] font-medium text-[#0A2E2E] dark:text-[hsl(200_20%_80%)]">
//           Best time: 7:00 PM ET
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─── Icon box ───────────────────────────────────────────────────────── */
// function IconBox({ Icon }: { Icon: React.ElementType }) {
//   return (
//     <div
//       className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//       style={{ background: "#169B7F14", border: "1.5px solid #169B7F30" }}
//     >
//       <Icon className="w-[18px] h-[18px]" style={{ color: "#169B7F" }} strokeWidth={1.75} />
//     </div>
//   );
// }

// /* ─── Small feature cards ────────────────────────────────────────────── */
// const smallFeatures = [
//   {
//     Icon: PenLine,
//     title: "AI Caption Gen",
//     description:
//       "Professional captions in seconds, tailored to your brand voice and platform tone.",
//   },
//   {
//     Icon: Hash,
//     title: "Hashtag Suggestions",
//     description:
//       "10–15 smart tags per post — broad, niche, and Reels mix for maximum reach.",
//   },
//   {
//     Icon: Upload,
//     title: "Image Upload",
//     description:
//       "Direct assets library with simple drag-and-drop. Supports all major formats.",
//   },
//   {
//     Icon: FolderOpen,
//     title: "Content History",
//     description:
//       "Every post saved and searchable. Reuse, remix, or repurpose anytime.",
//   },
//   {
//     Icon: Cpu,
//     title: "Fine-tuned Model",
//     description:
//       "Our custom Phi-2 model writes like a real content creator — not a generic AI.",
//   },
// ];

// /* ─── Main export ────────────────────────────────────────────────────── */
// export function Features() {
//   const cardBase =
//     "bg-white dark:bg-[hsl(200_15%_14%)] border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)] rounded-2xl shadow-[0_2px_24px_rgba(10,46,46,0.05)] dark:shadow-none transition-colors duration-300";

//   return (
//     <section
//       id="features"
//       className="w-full py-20 md:py-24 px-4 bg-[hsl(200_25%_94%)] dark:bg-[hsl(200_20%_9%)] transition-colors duration-300"
//     >
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-10 md:mb-14">
//           <p
//             className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3"
//             style={{ color: "#169B7F" }}
//           >
//             Features
//           </p>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug text-[#0A2E2E] dark:text-[hsl(200_20%_90%)]">
//             Everything you need to post smarter.
//           </h2>
//         </div>

//         {/* Row 1 */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           {/* Wide card */}
//           <div className={`${cardBase} md:col-span-2 p-6 sm:p-7 flex flex-col`}>
//             <IconBox Icon={PenLine} />
//             <div className="mt-4">
//               <h3 className="font-bold text-[15px] text-[#0A2E2E] dark:text-[hsl(200_20%_88%)] mb-1.5">
//                 Multi-Platform Publishing
//               </h3>
//               <p className="text-sm text-[#0A2E2E65] dark:text-[hsl(200_10%_55%)] leading-relaxed max-w-sm">
//                 One dashboard to rule them all. Write once, customize for each platform, and hit publish.
//               </p>
//             </div>
//             <PublishIllustration />
//           </div>

//           {/* Scheduler card */}
//           <div className={`${cardBase} p-6 sm:p-7 flex flex-col`}>
//             <IconBox Icon={Calendar} />
//             <div className="mt-4">
//               <h3 className="font-bold text-[15px] text-[#0A2E2E] dark:text-[hsl(200_20%_88%)] mb-1.5">
//                 Smart Auto-Scheduler
//               </h3>
//               <p className="text-sm text-[#0A2E2E65] dark:text-[hsl(200_10%_55%)] leading-relaxed">
//                 AI analyzes your audience behaviour to suggest the exact minute your followers are most active.
//               </p>
//             </div>
//             <SchedulerIllustration />
//           </div>
//         </div>

//         {/* Row 2 — 3 equal small cards, last 2 centered on lg */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {smallFeatures.map(({ Icon, title, description }) => (
//             <div
//               key={title}
//               className={`${cardBase} p-6 flex flex-col gap-3 hover:border-[#169B7F35] dark:hover:border-[#169B7F50]`}
//             >
//               <IconBox Icon={Icon} />
//               <h3 className="font-bold text-[15px] text-[#0A2E2E] dark:text-[hsl(200_20%_88%)]">
//                 {title}
//               </h3>
//               <p className="text-sm text-[#0A2E2E65] dark:text-[hsl(200_10%_55%)] leading-relaxed">
//                 {description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }