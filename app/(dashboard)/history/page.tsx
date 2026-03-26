// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";
// import { redirect } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { History, Sparkles } from "lucide-react";
// import Link from "next/link";
// import { CopyButton } from "@/componentss/shared/CopyButton";

// export default async function HistoryPage() {
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in");

//   const user = await prisma.user.findUnique({ where: { clerkId: userId } });

//   const generations = user
//     ? await prisma.generation.findMany({
//         where: { userId: user.id, isDeleted: false },
//         orderBy: { createdAt: "desc" },
//         take: 50,
//       })
//     : [];

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Content History</h1>
//         <p className="text-muted-foreground mt-1">
//           All your generated content in one place
//         </p>
//       </div>

//       {generations.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 gap-4">
//           <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
//             <History className="w-8 h-8 text-muted-foreground" />
//           </div>
//           <h3 className="font-semibold text-lg">No content yet</h3>
//           <p className="text-muted-foreground text-sm text-center max-w-sm">
//             Start generating captions and images. They'll all be saved here automatically.
//           </p>
//           <Button asChild>
//             <Link href="/generate">
//               <Sparkles className="w-4 h-4 mr-2" />
//               Generate your first post
//             </Link>
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {generations.map((gen) => (
//             <Card key={gen.id}>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <div className="flex items-center gap-2">
//                   <Badge variant="secondary">{gen.platform}</Badge>
//                   <Badge variant="outline">{gen.tone}</Badge>
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   {new Date(gen.createdAt).toLocaleDateString()}
//                 </span>
//               </CardHeader>
//               <CardContent className="flex flex-col gap-3">
//                 <p className="text-sm font-medium text-muted-foreground">
//                   {gen.topic}
//                 </p>
//                 <p className="text-sm line-clamp-3">{gen.caption}</p>
//                 <div className="flex flex-wrap gap-1">
//                   {gen.hashtags.slice(0, 5).map((tag, i) => (
//                     <span key={i} className="text-xs text-primary">
//                       {tag}
//                     </span>
//                   ))}
//                   {gen.hashtags.length > 5 && (
//                     <span className="text-xs text-muted-foreground">
//                       +{gen.hashtags.length - 5} more
//                     </span>
//                   )}
//                 </div>
//                 <CopyButton text={`${gen.caption}\n\n${gen.hashtags.join(" ")}`} />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

















import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Sparkles } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/componentss/shared/CopyButton";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const generations = user
    ? await prisma.generation.findMany({
        where: { userId: user.id, isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content History</h1>
        <p className="text-muted-foreground mt-1">
          All your generated content in one place
        </p>
      </div>

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No content yet</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            Start generating captions and images. They'll all be saved here automatically.
          </p>
          <Button asChild>
            <Link href="/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate your first post
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generations.map((gen) => (
            <Card key={gen.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{gen.platform}</Badge>
                  <Badge variant="outline">{gen.tone}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(gen.createdAt).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {gen.topic}
                </p>
                <p className="text-sm line-clamp-3">{gen.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {gen.hashtags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                  {gen.hashtags.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{gen.hashtags.length - 5} more
                    </span>
                  )}
                </div>
                <CopyButton text={`${gen.caption}\n\n${gen.hashtags.join(" ")}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}