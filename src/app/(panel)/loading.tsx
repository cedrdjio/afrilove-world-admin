export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-sand/40" />
          <span className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-caramel border-r-gold" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.png" alt="" className="absolute inset-0 m-auto h-8 w-8 animate-heartbeat object-contain" />
        </div>
        <p className="text-sm font-medium text-espresso-500">Chargement…</p>
      </div>
    </div>
  );
}
