// src/app/shared/components/offline-indicator/offline-indicator.component.ts
import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../../../core/services/network.service';
import { OfflineStorageService } from '../../../core/services/offline-storage.service';

@Component({
  selector: 'app-offline-indicator',
  templateUrl: './offline-indicator.component.html',
  styleUrls: ['./offline-indicator.component.scss'],
})
export class OfflineIndicatorComponent implements OnInit {
  isOnline = true;
  pendingCount = 0;

  constructor(
    private networkService: NetworkService,
    private offlineStorage: OfflineStorageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.networkService.isOnline$.subscribe(async (status) => {
      this.isOnline = status;
      await this.updatePendingCount();
    });

    await this.updatePendingCount();
  }

  private async updatePendingCount(): Promise<void> {
    const stats = await this.offlineStorage.getStorageStats();
    this.pendingCount = stats.pendingSync;
  }
}
