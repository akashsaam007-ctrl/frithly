import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const basicList = ["Name", "Title", "Email"];
const frithlyList = [
  "Name",
  "Title",
  "Email",
  "Recent LinkedIn posts",
  "Trigger signals (why this person, right now)",
  "Company news this week",
  "3 personalized openers (situational, content, company-signal)",
  "Recommended angle for each lead",
  "Verified email status",
];

export function Comparison() {
  return (
    <section className="py-20">
      <Container className="space-y-10">
        <div className="text-center">
          <h2>Lists vs. Intelligence</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-transparent bg-stone-100 text-muted">
            <CardHeader>
              <CardTitle className="text-xl text-ink">
                What you get from Apollo/ZoomInfo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {basicList.map((item) => (
                  <li key={item} className="text-base font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-terracotta">
            <CardHeader>
              <CardTitle className="text-xl text-ink">What you get from Frithly</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {frithlyList.map((item, index) => (
                  <li key={item} className="flex items-start gap-3 text-base text-ink">
                    {index >= 3 ? (
                      <Check className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                    ) : (
                      <span className="w-4" aria-hidden="true" />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-center">Same person. Different product.</h3>
      </Container>
    </section>
  );
}
