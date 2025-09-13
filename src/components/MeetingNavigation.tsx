import { CheckCircle, Users, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NavigationProps = {
  currentStep: "attendance" | "agenda" | "protocol";
  onStepChange: (step: "attendance" | "agenda" | "protocol") => void;
  quorumStatus: { hasQuorum: boolean; present: number; total: number };
};

export const MeetingNavigation = ({ currentStep, onStepChange, quorumStatus }: NavigationProps) => {
  const steps = [
    {
      key: "attendance" as const,
      title: "Teilnehmerliste",
      icon: Users,
      description: "Anwesenheit erfassen"
    },
    {
      key: "agenda" as const,
      title: "Tagesordnung",
      icon: FileText,
      description: "TOPs & Abstimmungen"
    },
    {
      key: "protocol" as const,
      title: "Protokoll",
      icon: Download,
      description: "Export vorbereiten"
    }
  ];

  return (
    <nav className="space-y-4">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">Sitzungsschritte</h3>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === "attendance" && quorumStatus.total > 0) ||
              (step.key === "agenda" && currentStep === "protocol");

            return (
              <Button
                key={step.key}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start h-auto p-4"
                onClick={() => onStepChange(step.key)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {isCompleted && (
                      <CheckCircle className="h-3 w-3 text-success absolute -top-1 -right-1 bg-background rounded-full" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Quorum Status */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Beschlussfähigkeit</h4>
        <div className="space-y-2">
          <Badge 
            variant={quorumStatus.hasQuorum ? "default" : "destructive"}
            className="w-full justify-center"
          >
            {quorumStatus.hasQuorum ? "Beschlussfähig" : "Nicht beschlussfähig"}
          </Badge>
          <p className="text-sm text-muted-foreground text-center">
            {quorumStatus.present} von {quorumStatus.total} Stupa-Mitgliedern anwesend
          </p>
        </div>
      </div>
    </nav>
  );
};