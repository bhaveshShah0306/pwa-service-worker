// src/app/app.component.ts
import { Component } from '@angular/core';
// import {} from './image-swap.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Travel Booking App';

  isSmallImage: boolean = false;
  isWelcome: boolean = true;
  toggleImageSize(): void {
    this.isSmallImage = !this.isSmallImage;
  }

  changeImage() {
    this.isWelcome = !this.isWelcome;
  }
}
