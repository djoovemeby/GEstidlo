import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly technicianKey = 'gestidlo.profile.technicianName';

  getTechnicianName(): string {
    return localStorage.getItem(this.technicianKey) ?? 'tech';
  }

  setTechnicianName(name: string) {
    localStorage.setItem(this.technicianKey, name || 'tech');
  }
}

