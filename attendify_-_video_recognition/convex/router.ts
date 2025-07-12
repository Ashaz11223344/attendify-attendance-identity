import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Storage endpoint to serve files with proper headers
http.route({
  path: "/storage/{storageId}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.pathname.split('/').pop();
    
    try {
      const url = await ctx.storage.getUrl(storageId as any);
      if (!url) {
        return new Response("File not found", { status: 404 });
      }
      
      // Fetch the file from storage
      const response = await fetch(url);
      if (!response.ok) {
        return new Response("File not found", { status: 404 });
      }
      
      const blob = await response.blob();
      
      // Return the file with appropriate headers
      return new Response(blob, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (error) {
      console.error("Storage error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
