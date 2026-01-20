import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BffApiService {
  private readonly baseUrl = 'http://localhost:9083/api';

  constructor(private readonly http: HttpClient) {}

  dashboard() {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  ingestMeasurement(payload: {
    pointId: string;
    sensorId: string;
    type: 'PRESSURE' | 'FLOW' | 'LEVEL';
    value: number;
    unit: string;
    timestamp?: string;
  }) {
    return this.http.post<any>(`${this.baseUrl}/iot/measurements`, payload);
  }

  alerts(status: 'ACTIVE' | 'ACK' | 'CLOSED' = 'ACTIVE') {
    return this.http.get<any>(`${this.baseUrl}/alerts`, {
      params: new HttpParams().set('status', status)
    });
  }

  ackAlert(id: number) {
    return this.http.post<any>(`${this.baseUrl}/alerts/${id}/ack`, {});
  }

  tickets() {
    return this.http.get<any>(`${this.baseUrl}/tickets`);
  }

  createTicket(alertId: number, assignee: string) {
    return this.http.post<any>(`${this.baseUrl}/tickets`, { alertId, assignee });
  }

  advanceTicket(id: number) {
    return this.http.post<any>(`${this.baseUrl}/tickets/${id}/advance`, {});
  }

  history(pointId: string, type: 'PRESSURE' | 'FLOW' | 'LEVEL', from: string, to: string) {
    return this.http.get<any>(`${this.baseUrl}/history/points/${pointId}`, {
      params: new HttpParams().set('type', type).set('from', from).set('to', to)
    });
  }

  processDefinitions() {
    return this.http.get<any[]>(`${this.baseUrl}/process-definitions`);
  }

  startProcess(definitionKey: string, variables?: Record<string, unknown>) {
    return this.http.post<any>(`${this.baseUrl}/process-instances/${definitionKey}/start`, variables ?? {});
  }

  tasks(processInstanceId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/tasks`, {
      params: new HttpParams().set('processInstanceId', processInstanceId)
    });
  }

  completeTask(taskId: string, variables?: Record<string, unknown>) {
    return this.http.post<void>(`${this.baseUrl}/tasks/${taskId}/complete`, variables ?? {});
  }
}
