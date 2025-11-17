// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkerModule } from 'angular-web-worker/angular';

import { AppComponent } from './app.component';
import { ExampleWorker } from './example.worker';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ImageSwapDirective } from './image-swap.directive';

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
    ImageSwapDirective,
    TicketActionsComponent,
    TicketActionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forRoot(routes),
    WorkerModule.forWorkers([
      {
        worker: ExampleWorker,
        initFn: () =>
          new Worker(new URL('./example.worker.ts', import.meta.url), {
            type: 'module',
          }),
      },
    ]),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
