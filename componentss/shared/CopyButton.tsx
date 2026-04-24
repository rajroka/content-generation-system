// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Copy, CheckCircle2 } from "lucide-react";
// import { toast } from "sonner";

// export function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     await navigator.clipboard.writeText(text);
//     setCopied(true);
//     toast.success("Copied to clipboard");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <Button variant="outline" size="sm" onClick={handleCopy} className="w-fit">
//       {copied ? (
//         <>
//           <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
//           Copied
//         </>
//       ) : (
//         <>
//           <Copy className="w-4 h-4 mr-2" />
//           Copy caption
//         </>
//       )}
//     </Button>
//   );
// }








"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="w-fit">
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Copy caption
        </>
      )}
    </Button>
  );
}