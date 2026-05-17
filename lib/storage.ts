import { HttpError } from "./errors";

const STORAGE_PREFIXES = [
  "/storage/v1/object/",
  "/storage/v1/object/public/",
  "/storage/v1/object/sign/",
];

export type ParsedStorageUrl = {
  bucket: string;
  path: string;
};

export function parseSupabaseStorageUrl(fileUrl: string, supabaseUrl: string): ParsedStorageUrl {
  let parsedFileUrl: URL;
  let parsedSupabaseUrl: URL;

  try {
    parsedFileUrl = new URL(fileUrl);
    parsedSupabaseUrl = new URL(supabaseUrl);
  } catch {
    throw new HttpError(400, "fileUrl must be a valid Supabase storage URL");
  }

  if (parsedFileUrl.host !== parsedSupabaseUrl.host) {
    throw new HttpError(400, "fileUrl must point to this Supabase project, not an external source");
  }

  const prefix = STORAGE_PREFIXES.find((candidate) => parsedFileUrl.pathname.startsWith(candidate));
  if (!prefix) {
    throw new HttpError(400, "fileUrl must point to a Supabase storage object");
  }

  const objectPath = decodeURIComponent(parsedFileUrl.pathname.slice(prefix.length));
  const [bucket, ...pathParts] = objectPath.split("/");
  const path = pathParts.join("/");

  if (!bucket || !path) {
    throw new HttpError(400, "fileUrl must include a storage bucket and object path");
  }

  if (bucket !== "rulebooks") {
    throw new HttpError(400, "fileUrl must point to the rulebooks bucket");
  }

  if (!path.toLowerCase().endsWith(".pdf")) {
    throw new HttpError(400, "fileUrl must point to a PDF object");
  }

  return { bucket, path };
}
