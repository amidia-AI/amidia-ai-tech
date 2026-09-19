// Audio functionality has been fully disabled per user request
class SoundFX {
  public enabled: boolean = false;

  public playClick(_pitch?: number) {
    // Disabled
  }

  public playSlide() {
    // Disabled
  }

  public playSwipe(_pitch?: number) {
    // Disabled
  }

  public playSuccess() {
    // Disabled
  }

  public playDeep() {
    // Disabled
  }
}

export const soundFX = new SoundFX();
