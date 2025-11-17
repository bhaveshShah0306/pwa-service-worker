// src/app/core/services/sync.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OfflineStorageService } from './offline-storage.service';
import { NetworkService } from './network.service';
import { Booking } from '../models/booking.model';
import { SyncStatus } from '../models/syncstatus.model';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private syncStatus$ = new BehaviorSubject<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0,
    syncErrors: [],
  });

  private autoSyncSubscription?: Subscription;

  constructor(
    private offlineStorage: OfflineStorageService,
    private networkService: NetworkService
  ) {
    this.initAutoSync();
  }

  // Observable for components to subscribe to
  getSyncStatus() {
    return this.syncStatus$.asObservable();
  }

  // Initialize automatic sync when coming online
  private initAutoSync(): void {
    // Sync when network status changes to online
    this.networkService.isOnline$
      .pipe(filter((isOnline) => isOnline))
      .subscribe(() => {
        console.log('📡 Network online - starting auto sync');
        this.syncPendingBookings();
      });

    // Periodic sync every 5 minutes when online
    this.autoSyncSubscription = interval(300000) // 5 minutes
      .pipe(filter(() => this.networkService.isOnline$.value))
      .subscribe(() => {
        console.log('🔄 Periodic sync triggered');
        this.syncPendingBookings();
      });
  }

  // Main sync function
  async syncPendingBookings(): Promise<boolean> {
    const currentStatus = this.syncStatus$.value;

    // Prevent concurrent syncs
    if (currentStatus.isSyncing) {
      console.log('⏳ Sync already in progress');
      return false;
    }

    // Check if online
    if (!this.networkService.isOnline$.value) {
      console.log('📴 Cannot sync - offline');
      return false;
    }

    try {
      // Update status: syncing started
      this.updateSyncStatus({ isSyncing: true, syncErrors: [] });

      // Get all pending bookings
      const pendingBookings = await this.offlineStorage.getPendingBookings();
      console.log(
        `🔄 Found ${pendingBookings.length} pending bookings to sync`
      );

      if (pendingBookings.length === 0) {
        this.updateSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date(),
          pendingCount: 0,
        });
        return true;
      }

      // Sync each booking
      const results = await Promise.allSettled(
        pendingBookings.map((booking) => this.syncBooking(booking))
      );

      // Count successes and failures
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Collect error messages
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason?.message || 'Unknown error');

      // Update final status
      this.updateSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingCount: failed,
        failedCount: failed,
        syncErrors: errors,
      });

      console.log(
        `✅ Sync completed: ${successful} successful, ${failed} failed`
      );

      return failed === 0;
    } catch (error) {
      console.error('❌ Sync error:', error);
      this.updateSyncStatus({
        isSyncing: false,
        syncErrors: [(error as Error).message],
      });
      return false;
    }
  }

  // Sync individual booking
  private async syncBooking(booking: Booking): Promise<void> {
    if (!booking.id) {
      throw new Error('Booking has no ID');
    }

    try {
      // Simulate API call to sync booking
      await this.simulateApiSync(booking);

      // Update booking status to synced
      await this.offlineStorage.updateBookingSyncStatus(booking.id, 'synced');

      // Also update booking status to confirmed (since it's synced)
      const updatedBooking: Booking = {
        ...booking,
        status: 'confirmed',
        syncStatus: 'synced',
      };

      await this.offlineStorage.saveBooking(updatedBooking);

      console.log(`✅ Booking ${booking.id} synced successfully`);
    } catch (error) {
      console.error(`❌ Failed to sync booking ${booking.id}:`, error);

      // Mark as failed
      await this.offlineStorage.updateBookingSyncStatus(booking.id, 'failed');

      throw error;
    }
  }

  // Simulate API call (replace with actual API integration)
  private async simulateApiSync(booking: Booking): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() < 0.95) {
          resolve();
        } else {
          reject(new Error('API sync failed'));
        }
      }, 1000); // Simulate network delay
    });
  }

  // Force sync for a specific booking
  async forceSyncBooking(bookingId: string): Promise<boolean> {
    if (!this.networkService.isOnline$.value) {
      console.log('📴 Cannot sync - offline');
      return false;
    }

    try {
      const booking = await this.offlineStorage.getBookingById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      await this.syncBooking(booking);
      await this.updatePendingCount();
      return true;
    } catch (error) {
      console.error(`❌ Failed to force sync booking ${bookingId}:`, error);
      return false;
    }
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<boolean> {
    if (!this.networkService.isOnline$.value) {
      return false;
    }

    const failedBookings = await this.offlineStorage
      .getAllBookings()
      .then((bookings) => bookings.filter((b) => b.syncStatus === 'failed'));

    if (failedBookings.length === 0) {
      return true;
    }

    // Reset failed bookings to pending
    for (const booking of failedBookings) {
      if (booking.id) {
        await this.offlineStorage.updateBookingSyncStatus(
          booking.id,
          'pending'
        );
      }
    }

    // Sync all pending bookings
    return this.syncPendingBookings();
  }

  // Update sync status helper
  private updateSyncStatus(partial: Partial<SyncStatus>): void {
    const current = this.syncStatus$.value;
    this.syncStatus$.next({ ...current, ...partial });
  }

  // Get current pending count
  async updatePendingCount(): Promise<void> {
    const stats = await this.offlineStorage.getStorageStats();
    this.updateSyncStatus({ pendingCount: stats.pendingSync });
  }

  // Cleanup
  destroy(): void {
    if (this.autoSyncSubscription) {
      this.autoSyncSubscription.unsubscribe();
    }
  }
}
export { SyncStatus };
