/**
 * Seeds the two initial worlds specified in the build prompt.
 * FRAME is intentionally NOT seeded yet — it will be added later
 * through the admin panel, with zero code changes required.
 *
 * Artwork is left null here; the spec requires an elegant temporary
 * placeholder to be rendered by the FRONTEND when artworkUrl is empty
 * (see frontend/src/components placeholders in Phase 2), rather than
 * baking a fake permanent image into the seed data.
 */
import { PrismaClient, OpenMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const worlds = [
    {
      slug: "aftershow",
      name: "AFTERSHOW",
      description: "Explore television series and episodes.",
      destinationUrl: "https://frontend-aftershow.vercel.app/",
      artworkUrl: null,
      artworkAlt: "AFTERSHOW artwork placeholder",
      accentColor: "#8B8378",
      category: "tv",
      sortOrder: 0,
      isActive: true,
      openMode: OpenMode.SAME_TAB,
    },
    {
      slug: "anteiku",
      name: "ANTEIKU",
      description: "Explore the world of anime.",
      destinationUrl: "https://frontend-antieku.vercel.app/",
      artworkUrl: null,
      artworkAlt: "ANTEIKU artwork placeholder",
      accentColor: "#6E655A",
      category: "anime",
      sortOrder: 1,
      isActive: true,
      openMode: OpenMode.SAME_TAB,
    },
  ];

  for (const world of worlds) {
    await prisma.world.upsert({
      where: { slug: world.slug },
      update: world,
      create: world,
    });
    console.log(`Seeded world: ${world.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
