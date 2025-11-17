// src/app/core/services/offline-storage.service.ts
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
      bookings: '++id, ticketId, status, syncStatus, createdAt',
      tickets: 'id, from, to, date, type',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private db = new OfflineDatabase();

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    try {
      await this.db.open();
      console.log('✅ IndexedDB initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize IndexedDB:', error);
    }
  }

  // ========== BOOKING METHODS ==========

  async saveBooking(booking: Booking): Promise<string | undefined> {
    try {
      booking.createdAt = new Date();
      booking.syncStatus = navigator.onLine ? 'synced' : 'pending';
      const id = await this.db.bookings.add(booking);
      console.log('💾 Booking saved:', id);
      return id?.toString();
    } catch (error) {
      console.error('❌ Failed to save booking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      return await this.db.bookings.toArray();
    } catch (error) {
      console.error('❌ Failed to get bookings:', error);
      return [];
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      return await this.db.bookings.get(id);
    } catch (error) {
      console.error('❌ Failed to get booking:', error);
      return undefined;
    }
  }

  async getPendingBookings(): Promise<Booking[]> {
    try {
      return await this.db.bookings
        .where('syncStatus')
        .equals('pending')
        .toArray();
    } catch (error) {
      console.error('❌ Failed to get pending bookings:', error);
      return [];
    }
  }

  async updateBookingSyncStatus(
    id: string,
    status: 'synced' | 'pending' | 'failed'
  ): Promise<void> {
    try {
      await this.db.bookings.update(id, { syncStatus: status });
      console.log(`✅ Booking ${id} sync status updated to ${status}`);
    } catch (error) {
      console.error('❌ Failed to update booking sync status:', error);
    }
  }

  async deleteBooking(id: string): Promise<void> {
    try {
      await this.db.bookings.delete(id);
      console.log(`🗑️ Booking ${id} deleted`);
    } catch (error) {
      console.error('❌ Failed to delete booking:', error);
    }
  }

  // ========== TICKET METHODS ==========

  async cacheTickets(tickets: Ticket[]): Promise<void> {
    try {
      await this.db.tickets.bulkPut(tickets);
      console.log(`💾 ${tickets.length} tickets cached`);
    } catch (error) {
      console.error('❌ Failed to cache tickets:', error);
    }
  }

  async getCachedTickets(): Promise<Ticket[]> {
    try {
      return await this.db.tickets.toArray();
    } catch (error) {
      console.error('❌ Failed to get cached tickets:', error);
      return [];
    }
  }

  async searchTickets(
    from: string,
    to: string,
    date?: Date
  ): Promise<Ticket[]> {
    try {
      let query = this.db.tickets.where('[from+to]').equals([from, to]);

      if (date) {
        const tickets = await query.toArray();
        return tickets.filter(
          (t) => new Date(t.date).toDateString() === date.toDateString()
        );
      }

      return await query.toArray();
    } catch (error) {
      console.error('❌ Failed to search tickets:', error);
      return [];
    }
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    try {
      return await this.db.tickets.get(id);
    } catch (error) {
      console.error('❌ Failed to get ticket:', error);
      return undefined;
    }
  }

  // ========== UTILITY METHODS ==========

  async clearAllData(): Promise<void> {
    try {
      await this.db.bookings.clear();
      await this.db.tickets.clear();
      console.log('🗑️ All data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }

  async getStorageStats(): Promise<{
    bookings: number;
    tickets: number;
    pendingSync: number;
  }> {
    try {
      const bookingsCount = await this.db.bookings.count();
      const ticketsCount = await this.db.tickets.count();
      const pendingCount = await this.db.bookings
        .where('syncStatus')
        .equals('pending')
        .count();

      return {
        bookings: bookingsCount,
        tickets: ticketsCount,
        pendingSync: pendingCount,
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { bookings: 0, tickets: 0, pendingSync: 0 };
    }
  }
  async updateBooking(id: string, updates: Partial<Booking>): Promise<void> {
    try {
      await this.db.bookings.update(id, updates);
      console.log(`✅ Booking ${id} updated`);
    } catch (error) {
      console.error('❌ Failed to update booking:', error);
      throw error;
    }
  }
}
