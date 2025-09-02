// convex/hello.ts
import { query } from "./_generated/server";

export const hellovy = query({
  args: {},  // không cần tham số
  handler: () => {
    return "Xin chào Convex!"; // chỉ trả về một chuỗi
  },
});
