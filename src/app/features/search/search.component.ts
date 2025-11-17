// src/app/features/search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { OfflineStorageService } from '../../core/services/offline-storage.service';
import { Ticket } from '../../core/models/ticket.model';

@Component({
  selector: 'app-search',
  template: `
    <div class="search-container">
      <h1>🔍 Available Tickets</h1>

      <!-- Each ticket-card uses Shadow DOM with custom Material styles -->
      <div class="tickets-grid">
        <app-ticket-card *ngFor="let ticket of tickets" [ticket]="ticket">
        </app-ticket-card>
      </div>
    </div>
  `,
  styles: [
    `
      .search-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 32px;
      }

      .tickets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
      }
    `,
  ],
})
export class SearchComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(private offlineStorage: OfflineStorageService) {}

  async ngOnInit(): Promise<void> {
    this.tickets = await this.offlineStorage.getCachedTickets();
  }
}
