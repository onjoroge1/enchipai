import { Check, X } from "lucide-react";

const features = [
  { name: "En-suite Bathroom", ndovu: true, chui: true, kifaru: true, simba: true, twiga: true, kiboko: true, nyati: true },
  { name: "Private Viewing Deck", ndovu: true, chui: true, kifaru: true, simba: true, twiga: true, kiboko: true, nyati: true },
  { name: "King-size Bed", ndovu: true, chui: true, kifaru: true, simba: true, twiga: true, kiboko: true, nyati: true },
  { name: "Fine Linen", ndovu: true, chui: true, kifaru: true, simba: true, twiga: true, kiboko: true, nyati: true },
  { name: "Solar Power", ndovu: true, chui: true, kifaru: true, simba: true, twiga: true, kiboko: true, nyati: true },
  { name: "Mini Bar", ndovu: true, chui: false, kifaru: false, simba: false, twiga: false, kiboko: false, nyati: false },
  { name: "Binoculars", ndovu: false, chui: true, kifaru: false, simba: false, twiga: false, kiboko: false, nyati: false },
  { name: "Writing Desk", ndovu: false, chui: false, kifaru: true, simba: false, twiga: false, kiboko: false, nyati: true },
  { name: "Champagne Service", ndovu: false, chui: false, kifaru: false, simba: true, twiga: false, kiboko: false, nyati: false },
  { name: "Sundowner Kit", ndovu: false, chui: false, kifaru: false, simba: true, twiga: false, kiboko: false, nyati: false },
  { name: "Family Layout", ndovu: false, chui: false, kifaru: false, simba: false, twiga: true, kiboko: true, nyati: false },
  { name: "Interconnecting Rooms", ndovu: false, chui: false, kifaru: false, simba: false, twiga: true, kiboko: true, nyati: false },
  { name: "Junior Ranger Kit", ndovu: false, chui: false, kifaru: false, simba: false, twiga: true, kiboko: true, nyati: false },
  { name: "Butler Service", ndovu: true, chui: false, kifaru: false, simba: false, twiga: false, kiboko: true, nyati: false },
];

const tentNames = [
  { key: "ndovu" as const, name: "Ndovu", price: "$396" },
  { key: "chui" as const, name: "Chui", price: "$396" },
  { key: "kifaru" as const, name: "Kifaru", price: "$396" },
  { key: "simba" as const, name: "Simba", price: "$396" },
  { key: "twiga" as const, name: "Twiga", price: "$1,426" },
  { key: "kiboko" as const, name: "Kiboko", price: "$1,584" },
  { key: "nyati" as const, name: "Nyati", price: "$356" },
];

export function TentsComparison() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Compare
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mt-4 text-balance">
            Find Your Perfect Tent
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every tent is named after an iconic African animal and offers unique character.
            Compare amenities and features to choose the one that best suits your safari experience.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 lg:p-5 text-sm font-semibold text-foreground w-48">
                    Feature
                  </th>
                  {tentNames.map((t) => (
                    <th key={t.key} className="p-4 lg:p-5 text-center">
                      <p className="font-serif text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-primary font-semibold mt-1">{t.price}/night</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={i % 2 === 0 ? "bg-secondary/30" : ""}
                  >
                    <td className="p-4 lg:p-5 text-sm text-foreground font-medium">
                      {feature.name}
                    </td>
                    {tentNames.map((t) => (
                      <td key={t.key} className="p-4 lg:p-5 text-center">
                        {feature[t.key] ? (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
