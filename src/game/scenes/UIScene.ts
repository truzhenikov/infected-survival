import Phaser from 'phaser';
import type { UpgradeDefinition, UpgradeId } from '../types';

type IntermissionConfig = {
  waveNumber: number;
  offers: UpgradeDefinition[];
  timeoutMs: number;
  onSelect: (upgradeId: UpgradeId) => void;
};

type CardView = {
  background: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  description: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Zone;
};

export class UIScene extends Phaser.Scene {
  private overlay!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;
  private cardViews: CardView[] = [];
  private selectionHandler?: (upgradeId: UpgradeId) => void;
  private resizeHandler?: () => void;

  constructor() {
    super('ui');
  }

  create(): void {
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x020617, 0.74).setOrigin(0).setDepth(100);
    this.overlay.setInteractive();

    this.panel = this.add.rectangle(0, 0, 0, 0, 0x111827, 0.96).setDepth(101);
    this.panel.setStrokeStyle(2, 0xf59e0b, 0.9);

    this.titleText = this.add.text(0, 0, '', {
      color: '#f8fafc',
      fontFamily: 'Arial',
      fontSize: '28px',
      align: 'center'
    }).setOrigin(0.5).setDepth(102);

    this.subtitleText = this.add.text(0, 0, '', {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '16px',
      align: 'center',
      wordWrap: { width: 320 }
    }).setOrigin(0.5).setDepth(102);

    this.countdownText = this.add.text(0, 0, '', {
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontSize: '16px',
      align: 'center'
    }).setOrigin(0.5).setDepth(102);

    for (let index = 0; index < 3; index += 1) {
      const background = this.add.rectangle(0, 0, 0, 0, 0x1f2937, 1).setDepth(102);
      background.setStrokeStyle(2, 0x94a3b8, 0.8);

      const title = this.add.text(0, 0, '', {
        color: '#f8fafc',
        fontFamily: 'Arial',
        fontSize: '20px',
        align: 'center',
        wordWrap: { width: 220 }
      }).setOrigin(0.5).setDepth(103);

      const description = this.add.text(0, 0, '', {
        color: '#cbd5e1',
        fontFamily: 'Arial',
        fontSize: '15px',
        align: 'center',
        wordWrap: { width: 220 }
      }).setOrigin(0.5).setDepth(103);

      const hitArea = this.add.zone(0, 0, 0, 0).setDepth(104).setInteractive({ useHandCursor: true });
      hitArea.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        const upgradeId = hitArea.getData('upgradeId') as UpgradeId | undefined;
        if (upgradeId) {
          this.selectionHandler?.(upgradeId);
        }
      });

      this.cardViews.push({ background, title, description, hitArea });
    }

    this.resizeHandler = () => {
      this.layout();
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.resizeHandler) {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeHandler);
      }
    });

    this.layout();
    this.hideIntermission();
  }

  showIntermission(config: IntermissionConfig): void {
    this.selectionHandler = config.onSelect;
    this.titleText.setText(`Wave ${config.waveNumber} cleared`);
    this.subtitleText.setText('Choose one upgrade to keep the yard secure. Tap once to continue.');
    this.setIntermissionCountdown(config.timeoutMs);

    this.cardViews.forEach((card, index) => {
      const offer = config.offers[index];
      const isVisible = Boolean(offer);

      card.background.setVisible(isVisible);
      card.title.setVisible(isVisible);
      card.description.setVisible(isVisible);
      card.hitArea.setVisible(isVisible);
      card.hitArea.input!.enabled = isVisible;
      card.hitArea.setData('upgradeId', offer?.id);
      card.title.setText(offer?.name ?? '');
      card.description.setText(offer?.description ?? '');
    });

    this.setVisibleState(true);
    this.scene.bringToTop();
  }

  hideIntermission(): void {
    this.selectionHandler = undefined;
    this.setVisibleState(false);
  }

  setIntermissionCountdown(remainingMs: number): void {
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    this.countdownText.setText(`Auto-pick in ${remainingSeconds}s`);
  }

  private setVisibleState(visible: boolean): void {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.titleText.setVisible(visible);
    this.subtitleText.setVisible(visible);
    this.countdownText.setVisible(visible);

    this.cardViews.forEach((card) => {
      card.background.setVisible(visible && card.background.visible);
      card.title.setVisible(visible && card.title.visible);
      card.description.setVisible(visible && card.description.visible);
      card.hitArea.setVisible(visible && card.hitArea.visible);
      if (card.hitArea.input) {
        card.hitArea.input.enabled = visible && card.hitArea.visible;
      }
    });
  }

  private layout(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const panelWidth = Math.min(width - 24, 420);
    const panelHeight = Math.min(height - 32, 700);
    const panelX = width * 0.5;
    const panelY = height * 0.5;
    const cardWidth = panelWidth - 32;
    const cardHeight = Math.min(130, Math.max(108, height * 0.13));
    const firstCardY = panelY - Math.min(120, panelHeight * 0.22);
    const cardSpacing = cardHeight + 18;

    this.overlay.setSize(width, height);
    this.panel.setPosition(panelX, panelY).setSize(panelWidth, panelHeight);
    this.titleText.setPosition(panelX, panelY - panelHeight * 0.42);
    this.subtitleText.setPosition(panelX, panelY - panelHeight * 0.33).setWordWrapWidth(cardWidth - 20);
    this.countdownText.setPosition(panelX, panelY + panelHeight * 0.39);

    this.cardViews.forEach((card, index) => {
      const cardY = firstCardY + index * cardSpacing;
      card.background.setPosition(panelX, cardY).setSize(cardWidth, cardHeight);
      card.title.setPosition(panelX, cardY - 26).setWordWrapWidth(cardWidth - 28);
      card.description.setPosition(panelX, cardY + 18).setWordWrapWidth(cardWidth - 28);
      card.hitArea.setPosition(panelX, cardY).setSize(cardWidth, cardHeight);
    });
  }
}
