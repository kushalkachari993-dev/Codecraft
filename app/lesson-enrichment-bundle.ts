import { getLessonEnrichment, type LearningTrackId, type LessonEnrichment } from "./authored-lessons";
import { getRoundTwoLessonEnrichment } from "./authored-lessons-round2";
import { getRoundThreeLessonEnrichment } from "./authored-lessons-round3";
import { getRoundFourLessonEnrichment } from "./authored-lessons-round4";
import { getRoundFiveLessonEnrichment } from "./authored-lessons-round5";
import { getRoundSixLessonEnrichment } from "./authored-lessons-round6";
import { getRoundSevenLessonEnrichment } from "./authored-lessons-round7";
import { getRoundEightLessonEnrichment } from "./authored-lessons-round8";
import { getRoundNineLessonEnrichment } from "./authored-lessons-round9";
import { getRoundTenLessonEnrichment } from "./authored-lessons-round10";
import { getRoundElevenLessonEnrichment } from "./authored-lessons-round11";
import { getRoundTwelveLessonEnrichment } from "./authored-lessons-round12";
import { getRoundThirteenLessonEnrichment } from "./authored-lessons-round13";
import { getRoundFourteenLessonEnrichment } from "./authored-lessons-round14";
import { getRoundFifteenLessonEnrichment } from "./authored-lessons-round15";
import { getRoundSixteenLessonEnrichment } from "./authored-lessons-round16";
import { getRoundSeventeenLessonEnrichment } from "./authored-lessons-round17";

export function getAuthoredLessonEnrichment(trackId: LearningTrackId, paceId: string, title: string): LessonEnrichment | undefined {
  return getLessonEnrichment(trackId, paceId, title)
    ?? getRoundTwoLessonEnrichment(trackId, paceId, title)
    ?? getRoundThreeLessonEnrichment(trackId, paceId, title)
    ?? getRoundFourLessonEnrichment(trackId, paceId, title)
    ?? getRoundFiveLessonEnrichment(trackId, paceId, title)
    ?? getRoundSixLessonEnrichment(trackId, paceId, title)
    ?? getRoundSevenLessonEnrichment(trackId, paceId, title)
    ?? getRoundEightLessonEnrichment(trackId, paceId, title)
    ?? getRoundNineLessonEnrichment(trackId, paceId, title)
    ?? getRoundTenLessonEnrichment(trackId, paceId, title)
    ?? getRoundElevenLessonEnrichment(trackId, paceId, title)
    ?? getRoundTwelveLessonEnrichment(trackId, paceId, title)
    ?? getRoundThirteenLessonEnrichment(trackId, paceId, title)
    ?? getRoundFourteenLessonEnrichment(trackId, paceId, title)
    ?? getRoundFifteenLessonEnrichment(trackId, paceId, title)
    ?? getRoundSixteenLessonEnrichment(trackId, paceId, title)
    ?? getRoundSeventeenLessonEnrichment(trackId, paceId, title);
}
