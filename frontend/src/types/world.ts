// Mirrors backend/prisma/schema.prisma — kept in sync by hand for now.
// A future phase could generate this from an OpenAPI spec if useful.
export type OpenMode = "SAME_TAB" | "NEW_TAB";

export interface World {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  destinationUrl: string;
  artworkUrl: string | null;
  artworkAlt: string | null;
  accentColor: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  openMode: OpenMode;
  createdAt: string;
  updatedAt: string;
}
