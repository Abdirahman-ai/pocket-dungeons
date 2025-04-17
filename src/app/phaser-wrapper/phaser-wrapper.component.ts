// src/app/phaser-wrapper/phaser-wrapper.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Phaser from 'phaser';
import { MainScene } from '../phraser/main.scene';

@Component({
  selector: 'app-phaser-wrapper',
  template: `<div #gameContainer style="width:100%; height:100vh;"></div>`,
  standalone: true
})
export class PhaserWrapperComponent implements OnInit {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  ngOnInit(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: this.gameContainer.nativeElement,
      pixelArt: true,
      backgroundColor: '#1a1a1a',
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 240
      }
    };
  
    new Phaser.Game(config);
  }
}
