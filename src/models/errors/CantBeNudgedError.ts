// An error object that can be thrown when a user tries to nudge another user but they can't be nudged due to time restrictions..
// The error has a status code of 429 and a timer that indicates when the user can nudge the other user again.

export default class CantBeNudgedError extends Error {
  public status = 429;
  public nextNudgeTimeHours: string;
  public nextNudgeTimeMinutes: string;
  public nextNudgeTimeSeconds: string;

  constructor(
    nextNudgeTimeHours: string,
    nextNudgeTimeMinutes: string,
    nextNudgeTimeSeconds: string,
  ) {
    super("User can't be nudged yet");
    this.nextNudgeTimeHours = nextNudgeTimeHours;
    this.nextNudgeTimeMinutes = nextNudgeTimeMinutes;
    this.nextNudgeTimeSeconds = nextNudgeTimeSeconds;
  }
}
