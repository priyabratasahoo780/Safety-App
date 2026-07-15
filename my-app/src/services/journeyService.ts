export interface JourneyState {
  isActive: boolean;
  journeyId: string | null;
  destination: string | null;
  endTime: number | null;
}

type JourneyListener = (state: JourneyState) => void;

class JourneyService {
  private state: JourneyState = {
    isActive: false,
    journeyId: null,
    destination: null,
    endTime: null,
  };

  private listeners: Set<JourneyListener> = new Set();

  startJourney(journeyId: string, destination: string, durationMinutes: number) {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    this.state = {
      isActive: true,
      journeyId,
      destination,
      endTime,
    };
    this.notifyListeners();
  }

  endJourney() {
    this.state = {
      isActive: false,
      journeyId: null,
      destination: null,
      endTime: null,
    };
    this.notifyListeners();
  }

  getState(): JourneyState {
    return { ...this.state };
  }

  subscribe(listener: JourneyListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const journeyService = new JourneyService();
