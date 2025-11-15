import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WorkerModule } from 'angular-web-worker/angular'

import { AppComponent } from './app.component';
import { ExampleWorker } from './example.worker';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HomeComponent } from './features/home/home.component';
import { SearchComponent } from './features/search/search.component';
import { BookingComponent } from './features/booking/booking.component';
import { MyBookingComponent } from './features/my-booking/my-booking.component';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { TicketCardComponent } from './shared/components/ticket-card/ticket-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    BookingComponent,
    MyBookingComponent,
    OfflineIndicatorComponent,
    TicketCardComponent
  ],
  imports: [
    BrowserModule,
    WorkerModule.forWorkers([
      {worker: ExampleWorker, initFn: () => new Worker(new URL('./example.worker.ts', import.meta.url), {type: 'module'})},
      // {worker: ExampleWorker, initFn: () => new Worker('./example.worker.ts', {type: 'module'})},
    ]),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
