// src/app/core/services/data-init.service.ts
import { Injectable } from '@angular/core';
import { OfflineStorageService } from './offline-storage.service';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class DataInitService {
  constructor(private offlineStorage: OfflineStorageService) {}

  async initializeSampleData(): Promise<void> {
    try {
      // Check if tickets already exist
      const existingTickets = await this.offlineStorage.getCachedTickets();

      if (existingTickets.length > 0) {
        console.log('✅ Sample tickets already exist');
        return;
      }

      // Create sample tickets
      const sampleTickets: Ticket[] = [
        {
          id: 'TKT001',
          from: 'Delhi',
          to: 'Mumbai',
          date: new Date(Date.now() + 86400000), // Tomorrow
          price: 1500,
          type: 'flight',
          availableSeats: 45,
        },
        {
          id: 'TKT002',
          from: 'Delhi',
          to: 'Bangalore',
          date: new Date(Date.now() + 172800000), // Day after tomorrow
          price: 800,
          type: 'train',
          availableSeats: 120,
        },
        {
          id: 'TKT003',
          from: 'Mumbai',
          to: 'Goa',
          date: new Date(Date.now() + 259200000), // 3 days from now
          price: 350,
          type: 'bus',
          availableSeats: 30,
        },
        {
          id: 'TKT004',
          from: 'Bangalore',
          to: 'Chennai',
          date: new Date(Date.now() + 86400000),
          price: 600,
          type: 'train',
          availableSeats: 80,
        },
        {
          id: 'TKT005',
          from: 'Delhi',
          to: 'Jaipur',
          date: new Date(Date.now() + 172800000),
          price: 250,
          type: 'bus',
          availableSeats: 25,
        },
        {
          id: 'TKT006',
          from: 'Mumbai',
          to: 'Pune',
          date: new Date(Date.now() + 86400000),
          price: 200,
          type: 'bus',
          availableSeats: 35,
        },
        {
          id: 'TKT007',
          from: 'Chennai',
          to: 'Kochi',
          date: new Date(Date.now() + 259200000),
          price: 950,
          type: 'train',
          availableSeats: 90,
        },
        {
          id: 'TKT008',
          from: 'Hyderabad',
          to: 'Bangalore',
          date: new Date(Date.now() + 86400000),
          price: 1200,
          type: 'flight',
          availableSeats: 55,
        },
      ];

      // Cache the sample tickets
      await this.offlineStorage.cacheTickets(sampleTickets);
      console.log('✅ Sample tickets initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize sample data:', error);
    }
  }
}
