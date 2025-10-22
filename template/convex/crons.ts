import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup expired OTP codes every 15 minutes
crons.interval(
  "cleanup expired OTPs",
  { minutes: 15 },
  internal.otp.cleanupExpiredOTPs
);

// Cleanup old email logs every day at 2 AM
crons.daily(
  "cleanup old email logs",
  { hourUTC: 2, minuteUTC: 0 },
  internal.otp.cleanupOldEmailLogs
);

export default crons;
