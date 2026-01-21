import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NetworkNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type NodeStatus = {
  state: 'OK' | 'WARN' | 'CRIT' | 'OFFLINE';
  value?: number;
  unit?: string;
  subtitle?: string;
};

@Component({
  selector: 'app-network-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="netmap" role="group" aria-label="Network map">
      <div class="netmap-grid" aria-hidden="true"></div>

      <button
        type="button"
        class="netmap-node"
        *ngFor="let node of nodes"
        [class.netmap-node--ok]="statusOf(node.id).state === 'OK'"
        [class.netmap-node--warn]="statusOf(node.id).state === 'WARN'"
        [class.netmap-node--crit]="statusOf(node.id).state === 'CRIT'"
        [class.netmap-node--offline]="statusOf(node.id).state === 'OFFLINE'"
        [class.netmap-node--selected]="node.id === selectedId"
        [style.left.%]="node.x"
        [style.top.%]="node.y"
        (click)="select.emit(node.id)"
      >
        <div class="netmap-node-title">{{ node.label }}</div>
        <div class="netmap-node-value">{{ valueLabel(node.id) }}</div>
        <div class="netmap-node-sub">{{ statusOf(node.id).subtitle || '' }}</div>
      </button>
    </div>
  `
})
export class NetworkMapComponent {
  @Input({ required: true }) nodes: NetworkNode[] = [];
  @Input({ required: true }) status: Record<string, NodeStatus> = {};
  @Input() selectedId?: string;
  @Output() select = new EventEmitter<string>();

  statusOf(id: string): NodeStatus {
    return this.status[id] ?? { state: 'OFFLINE' };
  }

  valueLabel(id: string): string {
    const s = this.statusOf(id);
    if (typeof s.value !== 'number') {
      return s.state === 'OFFLINE' ? 'OFFLINE' : '-';
    }
    return `${s.value.toFixed(2)}${s.unit ? ' ' + s.unit : ''}`;
  }
}

