// components/MoodCheck.tsx
import React from 'react';
const EMOJI = ['😞','🙁','😐','🙂','😁'] as const;

export function MoodCheck({ todayScore, refetch }: { todayScore?: number, refetch: () => void }) {
  async function submit(score:number){
    await fetch('/api/mood',{method:'POST',body:JSON.stringify({score})});
    refetch();
  }

  return (
    <div className="flex gap-2 justify-center">
      {EMOJI.map((e, i) => (
        <button key={e}
          disabled={todayScore!==undefined}
          onClick={() => submit(i+1)}
          className={`text-3xl hover:scale-110 transition
                      ${todayScore===i+1 ? 'outline outline-2 outline-primary rounded-full' : ''}`}>
          {e}
        </button>
      ))}
    </div>
  );
}
