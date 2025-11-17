// src/app/features/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OfflineStorageService } from '../../core/services/offline-storage.service';
import { NetworkService } from '../../core/services/network.service';
import { Ticket } from '../../core/models/ticket.model';
import { Booking } from '../../core/models/booking.model';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  ticket: Ticket | null = null;
  isOnline = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private offlineStorage: OfflineStorageService,
    private networkService: NetworkService
  ) {}

  async ngOnInit(): Promise<void> {
    // Load ticket
    const ticketId = this.route.snapshot.paramMap.get('ticketId');
    if (ticketId) {
      this.ticket = (await this.offlineStorage.getTicketById(ticketId)) || null;
    }

    // Monitor network
    this.networkService.isOnline$.subscribe((status): void => {
      this.isOnline = status;
    });

    // Initialize form
    this.initForm();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      passengers: this.fb.array([this.createPassengerForm()]),
    });
  }

  private createPassengerForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
    });
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    if (this.passengers.length < 5) {
      this.passengers.push(this.createPassengerForm());
    }
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  async submitBooking(): Promise<void> {
    if (this.bookingForm.invalid || !this.ticket) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    const booking: Booking = {
      ticketId: this.ticket.id,
      passengers: this.bookingForm.value.passengers,
      totalAmount: this.ticket.price * this.passengers.length,
      status: 'pending',
      createdAt: new Date(),
      syncStatus: this.isOnline ? 'synced' : 'pending',
    };

    try {
      // saveBooking now returns a number (the auto-incremented ID)
      const bookingId = await this.offlineStorage.saveBooking(booking);

      const message = this.isOnline
        ? `✅ Booking confirmed! Booking ID: ${bookingId}`
        : `💾 Booking saved offline (ID: ${bookingId}). Will sync when online.`;

      alert(message);
      this.router.navigate(['/my-bookings']);
    } catch (error) {
      alert('❌ Failed to save booking');
      console.error(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  getTotalAmount(): number {
    return this.ticket ? this.ticket.price * this.passengers.length : 0;
  }
}
