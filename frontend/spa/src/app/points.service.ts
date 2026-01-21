import { Injectable } from '@angular/core';

export type PointType = 'KIOSK' | 'SCHOOL' | 'TANK' | 'SOURCE';

export type PointDefinition = {
  id: string;
  name: string;
  type: PointType;
  description?: string;
};

@Injectable({ providedIn: 'root' })
export class PointsService {
  private readonly points: PointDefinition[] = [
    { id: 'POINT-001', name: 'KIOSK-01', type: 'KIOSK', description: 'Kiosque principal' },
    { id: 'POINT-002', name: 'SCHOOL', type: 'SCHOOL', description: 'École / point critique' },
    { id: 'POINT-003', name: 'TANK', type: 'TANK', description: 'Réservoir' }
  ];

  all(): PointDefinition[] {
    return this.points;
  }

  get(id: string): PointDefinition | undefined {
    return this.points.find((p) => p.id === id);
  }

  label(id: string): string {
    return this.get(id)?.name ?? id;
  }
}
