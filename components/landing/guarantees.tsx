import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const guarantees = [
  {
    description:
      "If under half the leads match your ICP, we refund the month. No questions, no fights.",
    icon: "💯",
    title: "50% Match Guarantee",
  },
  {
    description:
      "Don't book a meeting from our leads in 30 days? We extend your subscription free for a month.",
    icon: "📅",
    title: "First Meeting Promise",
  },
  {
    description:
      "Cancel any month. No annual contracts. No cancellation fees. We earn your renewal every cycle.",
    icon: "🚪",
    title: "No Lock-in",
  },
];

export function Guarantees() {
  return (
    <section className="bg-white py-20">
      <Container className="space-y-10">
        <div className="text-center">
          <h2>Three reasons it&apos;s safe to try us.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {guarantees.map((guarantee) => (
            <Card key={guarantee.title} className="h-full">
              <CardHeader className="space-y-4">
                <span className="text-4xl">{guarantee.icon}</span>
                <CardTitle className="text-xl">{guarantee.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted">{guarantee.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
