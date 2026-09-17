import { summarizeFarmers } from './farmer-summary';

describe('summarizeFarmers', () => {
  it('aggregates assigned area, active crop profiles, and recorded seasonal harvests without guessing unknown units', () => {
    const summaries = summarizeFarmers(
      [{ userId: 'farmer-1', zoneIds: ['zone-1', 'zone-missing', 'zone-1'] }],
      [{ id: 'zone-1', areaM2: '12500' }],
      [
        {
          zoneId: 'zone-1',
          cropTypeId: 'mango',
          cropTypeName: 'Xoài',
          variety: 'Cát Chu',
          status: 'ACTIVE',
          treeCount: 2
        },
        {
          zoneId: 'zone-1',
          cropTypeId: 'mango',
          cropTypeName: 'Xoài',
          variety: 'Cát Chu',
          status: 'INACTIVE',
          treeCount: 1
        },
        {
          zoneId: 'zone-outside',
          cropTypeId: 'banana',
          cropTypeName: 'Chuối',
          variety: null,
          status: 'ACTIVE',
          treeCount: 10
        }
      ],
      [
        { zoneId: 'zone-1', seasonId: 'season-1', seasonName: 'Vụ 2026', seasonStartDate: '2026-01-01', unit: 'g', quantity: '8500', harvestCount: 1 },
        { zoneId: 'zone-1', seasonId: 'season-1', seasonName: 'Vụ 2026', seasonStartDate: '2026-01-01', unit: 'tấn', quantity: 1.5, harvestCount: 1 },
        { zoneId: 'zone-1', seasonId: 'season-1', seasonName: 'Vụ 2026', seasonStartDate: '2026-01-01', unit: 'bao', quantity: 4, harvestCount: 1 },
        // Historical harvests remain part of production totals even when a tree is now inactive.
        { zoneId: 'zone-1', seasonId: 'season-1', seasonName: 'Vụ 2026', seasonStartDate: '2026-01-01', unit: 'kg', quantity: 10, harvestCount: 1 },
        { zoneId: 'zone-1', seasonId: null, seasonName: null, seasonStartDate: null, unit: 'kg', quantity: 2, harvestCount: 1 }
      ]
    );

    expect(summaries.get('farmer-1')).toEqual({
      assignedZoneCount: 2,
      areaM2: 12500,
      zonesWithArea: 1,
      treeCount: 2,
      varieties: [{ cropTypeName: 'Xoài', variety: 'Cát Chu', treeCount: 2 }],
      seasonalProduction: [
        {
          seasonId: 'season-1',
          seasonName: 'Vụ 2026',
          harvestCount: 4,
          recordedMassKg: 1518.5,
          otherUnits: [{ unit: 'bao', quantity: 4 }]
        },
        {
          seasonId: null,
          seasonName: 'Chưa gắn mùa vụ',
          harvestCount: 1,
          recordedMassKg: 2,
          otherUnits: []
        }
      ]
    });
  });

  it('counts a shared zone for each assigned farmer but does not duplicate its area within one profile', () => {
    const summaries = summarizeFarmers(
      [
        { userId: 'farmer-1', zoneIds: ['zone-1', 'zone-1'] },
        { userId: 'farmer-2', zoneIds: ['zone-1'] }
      ],
      [{ id: 'zone-1', areaM2: 5000 }],
      [{ zoneId: 'zone-1', cropTypeId: 'mango', cropTypeName: 'Xoài', variety: null, status: 'ACTIVE', treeCount: 3 }],
      []
    );

    expect(summaries.get('farmer-1')).toMatchObject({ assignedZoneCount: 1, areaM2: 5000, treeCount: 3 });
    expect(summaries.get('farmer-2')).toMatchObject({ assignedZoneCount: 1, areaM2: 5000, treeCount: 3 });
  });

  it('returns explicit empty metrics for a farmer with no assigned zones', () => {
    expect(summarizeFarmers([{ userId: 'farmer-2', zoneIds: [] }], [], [], []).get('farmer-2')).toEqual({
      assignedZoneCount: 0,
      areaM2: null,
      zonesWithArea: 0,
      treeCount: 0,
      varieties: [],
      seasonalProduction: []
    });
  });
});
