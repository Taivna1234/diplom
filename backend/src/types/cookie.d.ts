declare module "cookie" {
  export function parse(str: string, options?: unknown): Record<string, string>
}
