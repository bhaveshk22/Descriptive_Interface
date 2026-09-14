import React, { useState } from "react";
import { EXAM_PROFILES } from "./constants/examProfiles";
import { useCountdownTimer } from "./hooks/useCountdownTimer";
import AnswerBox from "./components/AnswerBox/AnswerBox";
import ExamHeader from "./components/Header/ExamHeader";
import QuestionTabs from "./components/QuestionTabs/QuestionTabs";
import StatusMessages from "./components/StatusMessages/StatusMessages";

export default function ExamInterfaceReplica() {
  const [profileId, setProfileId] = useState(EXAM_PROFILES[0].id);
  const profile = EXAM_PROFILES.find((p) => p.id === profileId);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  const [timeLeft, setTimeLeft] = useCountdownTimer({
    started,
    finished,
    paused,
    onExpire: () => setFinished(true),
    initialSeconds: profile.timerMinutes * 60,
  });

  const currentQuestion = profile.questions[currentQIndex];

  const handleProfileChange = (e) => {
    const next = EXAM_PROFILES.find((p) => p.id === e.target.value);
    setProfileId(next.id);
    setCurrentQIndex(0);
    setAnswers({});
    setStarted(false);
    setFinished(false);
    setPaused(false);
    setResetCount((c) => c + 1);
    setTimeLeft(next.timerMinutes * 60);
  };

  const handleStart = () => {
    setStarted(true);
    setFinished(false);
    setPaused(false);
    setTimeLeft(profile.timerMinutes * 60);
  };

  const handleTogglePause = () => {
    setPaused((p) => !p);
  };

  const handleReset = () => {
    setStarted(false);
    setFinished(false);
    setPaused(false);
    setAnswers({});
    setCurrentQIndex(0);
    setResetCount((c) => c + 1);
    setTimeLeft(profile.timerMinutes * 60);
  };

  const lowTime = timeLeft <= 120 && started && !finished && !paused;

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <ExamHeader
        profiles={EXAM_PROFILES}
        profileId={profileId}
        onProfileChange={handleProfileChange}
        started={started}
        finished={finished}
        paused={paused}
        timeLeft={timeLeft}
        lowTime={lowTime}
        onStart={handleStart}
        onReset={handleReset}
        onTogglePause={handleTogglePause}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <QuestionTabs
          questions={profile.questions}
          currentIndex={currentQIndex}
          onSelect={setCurrentQIndex}
        />

        <div className="bg-white border border-slate-300">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">
              {currentQuestion.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Word limit: {currentQuestion.wordLimit} words
            </p>
          </div>
          <div className="p-4">
            <AnswerBox
              key={`${profile.id}-${currentQuestion.id}-${resetCount}`}
              initialValue={answers[currentQuestion.id] || ""}
              wordLimit={currentQuestion.wordLimit}
              disabled={!started || finished || paused}
              paused={paused}
              onChange={(v) =>
                setAnswers((a) => ({ ...a, [currentQuestion.id]: v }))
              }
            />
          </div>
        </div>

        <StatusMessages started={started} finished={finished} />
      </main>
    </div>
  );
}
