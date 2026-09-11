/**
 * Personalization config.
 *
 * This is the ONLY place the recipient's name and messages are defined.
 * Every scene (hero name, final reveal, personalized message, final
 * birthday message) reads from this object — nothing is hard-coded
 * elsewhere in the app.
 */
export interface BirthdayConfig {
  /** The recipient's name, shown in the reveal and final message. */
  name: string;
  /** First personalized line, shown after the main HAPPY BIRTHDAY reveal. */
  message1: string;
  /** Second personalized line. */
  message2: string;
  /** The closing signature line under the final message. */
  signoff: string;
  /** Number of candles on the cake (also controls the lighting sequence). */
  candleCount: number;
}

export const birthdayConfig: BirthdayConfig = {
  name: "Aanya",
  message1: "Today isn't just another day.",
  message2: "It's your day.",
  signoff: "Made just for you.",
  candleCount: 5,
};
