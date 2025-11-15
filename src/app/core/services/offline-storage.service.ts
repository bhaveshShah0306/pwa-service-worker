// offline-storage.service.ts
import Dexie from 'dexie';
import { Booking } from '../models/booking.model';
import { Ticket } from '../models/ticket.model';
import { Injectable } from '@angular/core';

export class OfflineDatabase extends Dexie {
  bookings!: Dexie.Table<Booking, string>;
  tickets!: Dexie.Table<Ticket, string>;

  constructor() {
    super('TravelBookingDB');
    this.version(1).stores({
      bookings: '++id, ticketId, status, syncStatus',
      tickets: 'id, from, to, date',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private db = new OfflineDatabase();

  async saveBooking(booking: Booking): Promise<void> {
    await this.db.bookings.add({
      ...booking,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    });
  }

  async getPendingBookings(): Promise<Booking[]> {
    return this.db.bookings.where('syncStatus').equals('pending').toArray();
  }

  async cacheTickets(tickets: Ticket[]): Promise<void> {
    await this.db.tickets.bulkPut(tickets);
  }

  async getCachedTickets(): Promise<Ticket[]> {
    return this.db.tickets.toArray();
  }
}
