import { Component } from '@angular/core';
import { PhaserWrapperComponent } from './phaser-wrapper/phaser-wrapper.component';

@Component({
  selector: 'app-root',
  imports: [PhaserWrapperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pocket-dungeons';
}
