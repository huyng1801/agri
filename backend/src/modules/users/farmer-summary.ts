export type FarmerSummary = {
  assignedZoneCount: number;
  areaM2: number | null;
  zonesWithArea: number;
  treeCount: number;
  varieties: Array<{ cropTypeName: string; variety: string | null; treeCount: number }>;
  seasonalProduction: Array<{
    seasonId: string | null;
    seasonName: string;
    harvestCount: number;
    recordedMassKg: number | null;
    otherUnits: Array<{ unit: string; quantity: number }>;
  }>;
};

type FarmerAssignmentInput = { userId: string; zoneIds: string[] };
type ZoneInput = { id: string; areaM2: unknown };
type TreeAggregateInput = {
  zoneId: string;
  cropTypeId: string;
  cropTypeName: string;
  variety: string | null;
  status: string;
  treeCount: number;
};
type HarvestAggregateInput = {
  zoneId: string;
  seasonId: string | null;
  seasonName: string | null;
  seasonStartDate: Date | string | null;
  unit: string;
  quantity: unknown;
  harvestCount: number;
};

type MutableSummary = {
  assignedZoneCount: number;
  areaM2: number;
  zonesWithArea: number;
  treeCount: number;
  varieties: Map<string, { cropTypeName: string; variety: string | null; treeCount: number }>;
  seasons: Map<string, {
    seasonId: string | null;
    seasonName: string;
    startDate: number;
    harvestCount: number;
    recordedMassKg: number | null;
    otherUnits: Map<string, { unit: string; quantity: number }>;
  }>;
};

const MASS_UNIT_TO_KG: Record<string, number> = {
  g: 0.001,
  gr: 0.001,
  gram: 0.001,
  grams: 0.001,
  kg: 1,
  kilo: 1,
  kilos: 1,
  ky: 1,
  kilogram: 1,
  kilograms: 1,
  kilogam: 1,
  ta: 100,
  tan: 1000,
  ton: 1000,
  tonne: 1000,
  tonnes: 1000
};

export function summarizeFarmers(
  assignments: FarmerAssignmentInput[],
  zones: ZoneInput[],
  treeAggregates: TreeAggregateInput[],
  harvestAggregates: HarvestAggregateInput[]
): Map<string, FarmerSummary> {
  const summaries = new Map<string, MutableSummary>();
  const usersByZone = new Map<string, Set<string>>();
  const zonesById = new Map(zones.map((zone) => [zone.id, zone]));

  for (const assignment of assignments) {
    const summary = createMutableSummary();
    summaries.set(assignment.userId, summary);
    const uniqueZoneIds = new Set(assignment.zoneIds);
    summary.assignedZoneCount = uniqueZoneIds.size;

    for (const zoneId of uniqueZoneIds) {
      const users = usersByZone.get(zoneId) ?? new Set<string>();
      users.add(assignment.userId);
      usersByZone.set(zoneId, users);

      const areaM2 = finiteNumber(zonesById.get(zoneId)?.areaM2);
      if (areaM2 !== null && areaM2 >= 0) {
        summary.areaM2 += areaM2;
        summary.zonesWithArea += 1;
      }
    }
  }

  for (const tree of treeAggregates) {
    if (tree.status === 'INACTIVE') continue;
    const userIds = usersByZone.get(tree.zoneId);
    if (!userIds?.size) continue;

    const normalizedVariety = tree.variety?.trim() || null;
    const varietyKey = `${tree.cropTypeId}\u0000${normalizedVariety?.toLocaleLowerCase('vi-VN') ?? ''}`;

    for (const userId of userIds) {
      const summary = summaries.get(userId);
      if (!summary) continue;
      summary.treeCount += tree.treeCount;

      const variety = summary.varieties.get(varietyKey) ?? {
        cropTypeName: tree.cropTypeName,
        variety: normalizedVariety,
        treeCount: 0
      };
      variety.treeCount += tree.treeCount;
      summary.varieties.set(varietyKey, variety);
    }
  }

  for (const harvest of harvestAggregates) {
    const userIds = usersByZone.get(harvest.zoneId);
    if (!userIds?.size) continue;
    const seasonKey = harvest.seasonId ?? '__unassigned_season__';

    for (const userId of userIds) {
      const summary = summaries.get(userId);
      if (!summary) continue;
      const season = summary.seasons.get(seasonKey) ?? {
        seasonId: harvest.seasonId,
        seasonName: harvest.seasonName ?? (harvest.seasonId ? 'Mùa vụ chưa xác định' : 'Chưa gắn mùa vụ'),
        startDate: dateValue(harvest.seasonStartDate),
        harvestCount: 0,
        recordedMassKg: null,
        otherUnits: new Map<string, { unit: string; quantity: number }>()
      };
      const quantity = finiteNumber(harvest.quantity);
      if (quantity !== null && quantity > 0) {
        const factor = massFactorToKg(harvest.unit);
        if (factor !== null) {
          season.recordedMassKg = (season.recordedMassKg ?? 0) + quantity * factor;
        } else {
          const unit = harvest.unit.trim() || 'không rõ đơn vị';
          const unitKey = unit.toLocaleLowerCase('vi-VN');
          const otherUnit = season.otherUnits.get(unitKey) ?? { unit, quantity: 0 };
          otherUnit.quantity += quantity;
          season.otherUnits.set(unitKey, otherUnit);
        }
        season.harvestCount += harvest.harvestCount;
      }
      summary.seasons.set(seasonKey, season);
    }
  }

  return new Map(
    [...summaries].map(([userId, summary]) => [userId, {
      assignedZoneCount: summary.assignedZoneCount,
      areaM2: summary.zonesWithArea > 0 ? summary.areaM2 : null,
      zonesWithArea: summary.zonesWithArea,
      treeCount: summary.treeCount,
      varieties: [...summary.varieties.values()].sort((left, right) =>
        right.treeCount - left.treeCount || left.cropTypeName.localeCompare(right.cropTypeName, 'vi') || (left.variety ?? '').localeCompare(right.variety ?? '', 'vi')
      ),
      seasonalProduction: [...summary.seasons.values()]
        .sort((left, right) => right.startDate - left.startDate || left.seasonName.localeCompare(right.seasonName, 'vi'))
        .map(({ startDate: _startDate, otherUnits, ...season }) => ({
          ...season,
          recordedMassKg: season.recordedMassKg === null ? null : round(season.recordedMassKg, 3),
          otherUnits: [...otherUnits.values()].sort((left, right) => right.quantity - left.quantity).map((item) => ({ ...item, quantity: round(item.quantity, 3) }))
        }))
    }])
  );
}

function createMutableSummary(): MutableSummary {
  return {
    assignedZoneCount: 0,
    areaM2: 0,
    zonesWithArea: 0,
    treeCount: 0,
    varieties: new Map(),
    seasons: new Map()
  };
}

function finiteNumber(value: unknown): number | null {
  let candidate: unknown = value;
  if (candidate && typeof candidate === 'object' && 'toNumber' in candidate && typeof candidate.toNumber === 'function') {
    candidate = candidate.toNumber();
  }
  if (typeof candidate === 'string' && candidate.trim()) candidate = Number(candidate);
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null;
}

function massFactorToKg(unit: string) {
  const normalized = unit
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s._-]/g, '');
  if (normalized === 'tan' || normalized === 't') return 1000;
  return MASS_UNIT_TO_KG[normalized] ?? null;
}

function dateValue(value: Date | string | null | undefined) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const date = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(date) ? date : Number.NEGATIVE_INFINITY;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
