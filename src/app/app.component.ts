// src/app/app.component.ts
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { OfflineStorageService } from './core/services/offline-storage.service';
import { NetworkService } from './core/services/network.service';
import { Booking } from './core/models/booking.model';
import { Ticket } from './core/models/ticket.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  isOnline = true;
  storageStats = { bookings: 0, tickets: 0, pendingSync: 0 };
  sliderTranslate = 'translateX(0px)';

  private animation = {
    translate: 0,
    rightDirection: true,
  };

  constructor(
    private offlineStorage: OfflineStorageService,
    private networkService: NetworkService
  ) {}

  async ngOnInit(): Promise<void> {
    // Monitor network status
    this.networkService.isOnline$.subscribe((status) => {
      this.isOnline = status;
      console.log(`📡 Network status: ${status ? 'ONLINE' : 'OFFLINE'}`);
    });

    // Load storage stats
    await this.loadStats();

    // Seed sample data if empty
    await this.seedSampleData();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(this.animateFrame.bind(this));
  }

  private animateFrame(): void {
    this.animation.translate = this.animation.rightDirection
      ? this.animation.translate + 5
      : this.animation.translate - 5;

    if (this.animation.translate > window.innerWidth * 0.2 + 40) {
      this.animation.rightDirection = false;
    } else if (this.animation.translate < 0) {
      this.animation.rightDirection = true;
    }
    this.sliderTranslate = `translateX(${this.animation.translate}px)`;
    requestAnimationFrame(this.animateFrame.bind(this));
  }

  // ========== OFFLINE STORAGE TEST METHODS ==========

  async testSaveBooking(): Promise<void> {
    const testBooking: Booking = {
      ticketId: 'TKT-001',
      passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
      totalAmount: 1500,
      status: 'pending',
      createdAt: new Date(),
      syncStatus: 'pending',
    };

    try {
      const id = await this.offlineStorage.saveBooking(testBooking);
      alert(`✅ Booking saved with ID: ${id}`);
      await this.loadStats();
    } catch (error) {
      alert('❌ Failed to save booking');
    }
  }

  async testLoadBookings(): Promise<void> {
    const bookings = await this.offlineStorage.getAllBookings();
    console.log('📋 All Bookings:', bookings);
    alert(`Found ${bookings.length} bookings`);
  }

  async testLoadPending(): Promise<void> {
    const pending = await this.offlineStorage.getPendingBookings();
    console.log('⏳ Pending Bookings:', pending);
    alert(`Found ${pending.length} pending bookings`);
  }

  async testClearData(): Promise<void> {
    if (confirm('Are you sure you want to clear all data?')) {
      await this.offlineStorage.clearAllData();
      alert('🗑️ All data cleared');
      await this.loadStats();
    }
  }

  private async loadStats(): Promise<void> {
    this.storageStats = await this.offlineStorage.getStorageStats();
  }

  private async seedSampleData(): Promise<void> {
    const stats = await this.offlineStorage.getStorageStats();

    if (stats.tickets === 0) {
      const sampleTickets: Ticket[] = [
        {
          id: 'TKT-001',
          from: 'Delhi',
          to: 'Mumbai',
          date: new Date('2025-11-20'),
          price: 1500,
          type: 'train',
          availableSeats: 50,
        },
        {
          id: 'TKT-002',
          from: 'Delhi',
          to: 'Bangalore',
          date: new Date('2025-11-21'),
          price: 3500,
          type: 'flight',
          availableSeats: 20,
        },
        {
          id: 'TKT-003',
          from: 'Mumbai',
          to: 'Goa',
          date: new Date('2025-11-22'),
          price: 800,
          type: 'bus',
          availableSeats: 30,
        },
      ];

      await this.offlineStorage.cacheTickets(sampleTickets);
      console.log('🌱 Sample tickets seeded');
      await this.loadStats();
    }
  }
}
