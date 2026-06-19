import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAudioManager, playJump, playGameOver, stopAll } from '../src/audio.js';

describe('Audio Manager', () => {
  let mockPlay;
  let mockPause;

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();

    // Mock the Audio constructor in the global scope
    global.Audio = vi.fn().mockImplementation((src) => {
      return {
        src,
        currentTime: 0,
        play: mockPlay,
        pause: mockPause,
        onerror: null,
      };
    });
  });

  describe('createAudioManager', () => {
    it('should create an audio manager with jumpSound and gameOverSound', () => {
      const audio = createAudioManager();
      expect(audio.jumpSound).not.toBeNull();
      expect(audio.gameOverSound).not.toBeNull();
    });

    it('should load jump.wav and game_over.wav', () => {
      createAudioManager();
      expect(global.Audio).toHaveBeenCalledWith('assets/jump.wav');
      expect(global.Audio).toHaveBeenCalledWith('assets/game_over.wav');
    });

    it('should set jumpSound to null if Audio constructor throws', () => {
      global.Audio = vi.fn().mockImplementation((src) => {
        if (src === 'assets/jump.wav') throw new Error('Audio not supported');
        return { src, currentTime: 0, play: mockPlay, pause: mockPause, onerror: null };
      });

      const audio = createAudioManager();
      expect(audio.jumpSound).toBeNull();
      expect(audio.gameOverSound).not.toBeNull();
    });

    it('should set gameOverSound to null if Audio constructor throws', () => {
      global.Audio = vi.fn().mockImplementation((src) => {
        if (src === 'assets/game_over.wav') throw new Error('Audio not supported');
        return { src, currentTime: 0, play: mockPlay, pause: mockPause, onerror: null };
      });

      const audio = createAudioManager();
      expect(audio.jumpSound).not.toBeNull();
      expect(audio.gameOverSound).toBeNull();
    });
  });

  describe('playJump', () => {
    it('should reset currentTime and call play on jumpSound', () => {
      const audio = createAudioManager();
      audio.jumpSound.currentTime = 1.5;

      playJump(audio);

      expect(audio.jumpSound.currentTime).toBe(0);
      expect(mockPlay).toHaveBeenCalled();
    });

    it('should do nothing if jumpSound is null', () => {
      const audio = { jumpSound: null, gameOverSound: null };

      playJump(audio);

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should not throw if play() throws', () => {
      const audio = createAudioManager();
      audio.jumpSound.play = vi.fn().mockImplementation(() => {
        throw new Error('Playback failed');
      });

      expect(() => playJump(audio)).not.toThrow();
    });
  });

  describe('playGameOver', () => {
    it('should reset currentTime and call play on gameOverSound', () => {
      const audio = createAudioManager();
      audio.gameOverSound.currentTime = 2.0;

      playGameOver(audio);

      expect(audio.gameOverSound.currentTime).toBe(0);
      expect(mockPlay).toHaveBeenCalled();
    });

    it('should do nothing if gameOverSound is null', () => {
      const audio = { jumpSound: null, gameOverSound: null };

      playGameOver(audio);

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should not throw if play() throws', () => {
      const audio = createAudioManager();
      audio.gameOverSound.play = vi.fn().mockImplementation(() => {
        throw new Error('Playback failed');
      });

      expect(() => playGameOver(audio)).not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('should pause and reset currentTime for both sounds', () => {
      const audio = createAudioManager();
      audio.jumpSound.currentTime = 1.0;
      audio.gameOverSound.currentTime = 2.0;

      stopAll(audio);

      expect(mockPause).toHaveBeenCalledTimes(2);
      expect(audio.jumpSound.currentTime).toBe(0);
      expect(audio.gameOverSound.currentTime).toBe(0);
    });

    it('should handle null jumpSound gracefully', () => {
      const audio = createAudioManager();
      audio.jumpSound = null;

      expect(() => stopAll(audio)).not.toThrow();
      expect(mockPause).toHaveBeenCalledTimes(1); // only gameOverSound
    });

    it('should handle null gameOverSound gracefully', () => {
      const audio = createAudioManager();
      audio.gameOverSound = null;

      expect(() => stopAll(audio)).not.toThrow();
      expect(mockPause).toHaveBeenCalledTimes(1); // only jumpSound
    });

    it('should not throw if pause() throws', () => {
      const audio = createAudioManager();
      audio.jumpSound.pause = vi.fn().mockImplementation(() => {
        throw new Error('Pause failed');
      });

      expect(() => stopAll(audio)).not.toThrow();
    });
  });
});
