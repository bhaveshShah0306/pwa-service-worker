import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImageSwap]',
})
export class ImageSwapDirective {
  @HostBinding('src') public src: string | undefined;
  @HostListener('error')
  onError() {
    this.src = 'assets/omg.gif';
  }
  @Input()
  set appImageSwap(val: boolean) {
    if (val) {
      this.src = 'assets/welcome.gif';
    } else {
      this.src = 'assets/awesome-1.gif';
    }
  }
  constructor() {}
}
