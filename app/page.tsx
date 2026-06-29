// app/page.tsx — Anniversary 1 Year
// Changes from v1 (10 months):
//   - DrakePlayer removed (replaced by MonthTimeline)
//   - Countdown updated to April 30, 2027
//   - FutureLetter unlock date updated to April 30, 2027
//   - Color scheme shifted: pink → purple/lavender

import Countdown      from '@/components/Countdown'
import MonthTimeline  from '@/components/MonthTimeline'
import TaskList       from '@/components/TaskList'
import FutureLetter   from '@/components/FutureLetter'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080510] px-4 py-8 max-w-md mx-auto">

      {/* Hero countdown — updated to 1 year */}
      <Countdown />

      {/* 12-month journey timeline — replaces DrakePlayer */}
      <p className="text-[10px] tracking-widest text-white/20 uppercase mb-3 mt-7">
        12 months of us
      </p>
      <MonthTimeline />

      {/* Love tasks */}
      <p className="text-[10px] tracking-widest text-white/20 uppercase mb-3 mt-7">
        Anniversary tasks
      </p>
      <TaskList />

      {/* Future Letter — unlock 2027 */}
      <p className="text-[10px] tracking-widest text-white/20 uppercase mb-3 mt-7">
        Letter to future us
      </p>
      <FutureLetter />

      {/* Footer */}
      <div className="text-center mt-10 mb-4">
        <p className="text-[10px] text-white/10 tracking-widest">
          I & P · Year 01 🌸
        </p>
      </div>

    </main>
  )
}
