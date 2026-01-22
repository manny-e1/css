export function StatusStrip() {
  return (
    <section className="py-12 bg-gradient-to-r from-emerald-50 via-gray-50 to-emerald-50 border-y border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>Early platform in development</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>Pilot launching in Rwanda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>Focused on local materials and carbon transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
