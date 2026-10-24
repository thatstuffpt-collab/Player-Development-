import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { drillLibrary as defaultDrillLibrary, drillCategories } from "@/domain/drills/master-drill-library";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const measurementTypes = new Set(["makes-attempts", "time", "reps", "distance", "percentage", "none"]);
const categorySet = new Set<string>(drillCategories);

function text(value: unknown) {
  return String(value ?? "").trim();
}

function optionalText(value: unknown) {
  return text(value) || null;
}

function stringList(value: unknown) {
  if (Array.isArray(value)) return [...new Set(value.map(text).filter(Boolean))];
  return [...new Set(text(value).split(/[;|]/).map((item) => item.trim()).filter(Boolean))];
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  return ["true", "yes", "y", "1"].includes(text(value).toLowerCase());
}

type ImportedDrill = {
  name: string;
  normalizedName: string;
  primaryCategory: string;
  subcategory: string | null;
  aliases: string[];
  tags: string[];
  measurable: boolean;
  measurementType: string;
  variations: string[];
  notes: string | null;
  sortOrder: number;
};

function parseRow(raw: Record<string, unknown>, index: number): ImportedDrill {
  const name = text(raw.name ?? raw.drillName ?? raw["Drill Name"]);
  const primaryCategory = text(raw.primaryCategory ?? raw["Primary Category"] ?? raw.Category);
  const measurable = parseBoolean(raw.measurable ?? raw["Measurable?"]);
  const measurementType = text(raw.measurementType ?? raw["Measurement Type"]) || "none";

  if (!name) throw new Error(`Row ${index + 1}: Drill Name is required.`);
  if (!primaryCategory || !categorySet.has(primaryCategory)) {
    throw new Error(`Row ${index + 1}: Primary Category must be one of the supported library categories.`);
  }
  if (!measurementTypes.has(measurementType)) {
    throw new Error(`Row ${index + 1}: Measurement Type must be makes-attempts, time, reps, distance, percentage, or none.`);
  }

  const tags = stringList(raw.tags ?? raw.Tags);
  return {
    name,
    normalizedName: normalizeName(name),
    primaryCategory,
    subcategory: optionalText(raw.subcategory ?? raw.Subcategory ?? raw["What It Works On"]),
    aliases: stringList(raw.aliases ?? raw["Alternate Names / Aliases"] ?? raw["Alternate Names"]),
    tags: [...new Set([primaryCategory, ...tags.filter((tag) => categorySet.has(tag))])],
    measurable,
    measurementType: measurable ? measurementType : "none",
    variations: stringList(raw.variations ?? raw.Variations),
    notes: optionalText(raw.notes ?? raw.Notes),
    sortOrder: index,
  };
}

function defaultResponse() {
  return defaultDrillLibrary.map((drill, index) => ({
    id: `default-${index}`,
    name: drill.name,
    primaryCategory: drill.primaryCategory,
    subcategory: null,
    aliases: [],
    tags: drill.tags,
    measurable: drill.measurable ?? false,
    measurementType: drill.measurementType ?? "none",
    variations: drill.variations ?? [],
    notes: null,
    sortOrder: index,
    isDefault: true,
  }));
}

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const prisma = getPrisma();
    const drills = await prisma.drill.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (!drills.length) {
      return NextResponse.json({ drills: defaultResponse(), source: "default", categories: drillCategories });
    }

    return NextResponse.json({
      drills: drills.map((drill) => ({ ...drill, isDefault: false })),
      source: "custom",
      categories: drillCategories,
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to load drill library", error);
    return NextResponse.json({ error: "Could not load the drill library." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const body = await request.json();
    const action = text(body.action || "import");

    if (action === "reset") {
      const prisma = getPrisma();
      await prisma.drill.deleteMany({ where: { tenantId: user.tenantId } });
      return NextResponse.json({ ok: true, drills: defaultResponse(), source: "default" });
    }

    const mode = text(body.mode || "add").toLowerCase();
    if (!["add", "replace"].includes(mode)) {
      return NextResponse.json({ error: "Import mode must be add or replace." }, { status: 400 });
    }

    const rawRows = Array.isArray(body.rows) ? body.rows : [];
    if (!rawRows.length) {
      return NextResponse.json({ error: "Upload at least one drill row." }, { status: 400 });
    }
    if (rawRows.length > 1000) {
      return NextResponse.json({ error: "A single upload is limited to 1,000 drills." }, { status: 400 });
    }

    let rows: ImportedDrill[];
    try {
      rows = rawRows.map((row: Record<string, unknown>, index: number) => parseRow(row ?? {}, index));
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid drill row." }, { status: 400 });
    }

    const duplicateNames = rows
      .map((row) => row.normalizedName)
      .filter((name, index, all) => all.indexOf(name) !== index);
    if (duplicateNames.length) {
      return NextResponse.json({
        error: "Your upload contains duplicate drill names. Combine duplicate names into one drill and place alternate wording in the Aliases column.",
      }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      if (mode === "replace") {
        await tx.drill.deleteMany({ where: { tenantId: user.tenantId } });
      }

      for (const row of rows) {
        await tx.drill.upsert({
          where: {
            tenantId_normalizedName: {
              tenantId: user.tenantId,
              normalizedName: row.normalizedName,
            },
          },
          create: { tenantId: user.tenantId, ...row },
          update: {
            name: row.name,
            primaryCategory: row.primaryCategory,
            subcategory: row.subcategory,
            aliases: row.aliases,
            tags: row.tags,
            measurable: row.measurable,
            measurementType: row.measurementType,
            variations: row.variations,
            notes: row.notes,
            sortOrder: row.sortOrder,
            isActive: true,
          },
        });
      }
    });

    const drills = await prisma.drill.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ drills: drills.map((drill) => ({ ...drill, isDefault: false })), source: "custom" });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to import drill library", error);
    return NextResponse.json({ error: "Could not import the drill library." }, { status: 500 });
  }
}
