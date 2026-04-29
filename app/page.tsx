import Countdown    from '@/components/Countdown'
import DrakePlayer  from '@/components/DrakePlayer'
import FutureLetter from '@/components/FutureLetter'
import TaskList     from '@/components/TaskList'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-8 max-w-md mx-auto">

      {/* Hero countdown */}
      <Countdown />

      {/* Sentiment + Drake */}
      <p className="text-[10px] tracking-widest text-white/25 uppercase mb-3 mt-7">
        How's she feeling today?
      </p>
      <DrakePlayer />

      {/* Tasks */}
      <p className="text-[10px] tracking-widest text-white/25 uppercase mb-3 mt-7">
        Today's Love Tasks
      </p>
      <TaskList />

      {/* Future Letter */}
      <p className="text-[10px] tracking-widest text-white/25 uppercase mb-3 mt-7">
        Letter to Future Us
      </p>
      <FutureLetter />

      {/* Footer */}
      <div className="text-center mt-10 mb-4">
        <p className="text-[10px] text-white/15 tracking-widest">
          Made with love · I & P 🌸
        </p>
      </div>

    </main>
  )
}