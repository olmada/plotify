
export type PlantingMethod = 'directSow' | 'transplant' | 'purchasedStart';

export interface Plant {
  id: string;
  name: string;
  variety?: string;
  
  plantingMethod: PlantingMethod;
  seedPurchasedFrom?: string;
  seedPlantedDate?: Date;
  purchasedFrom?: string;
  transplantedDate?: Date;
  daysToHarvest?: number;
  expectedHarvestDate?: Date;
  gardenBed?: string;
}
