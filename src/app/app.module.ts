// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { TicketActionsComponent } from './shared/components/ticket-actions/ticket-actions.component';
import { TicketCardComponent } from './shared/components/ticket-card/ticket-card.component';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';

import { HomeComponent } from './features/home/home.component';
import { BookingComponent } from './features/booking/booking.component';
import { MyBookingComponent } from './features/my-booking/my-booking.component';
import { SearchComponent } from './features/search/search.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'booking/:ticketId', component: BookingComponent },
  { path: 'my-bookings', component: MyBookingComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    BookingComponent,
    MyBookingComponent,
    OfflineIndicatorComponent,
    TicketCardComponent,
    TicketActionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
