import path from "path";
export function safeJoin(...paths: string[]): string {
  return path.join(...paths);
}