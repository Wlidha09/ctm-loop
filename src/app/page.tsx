
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, CreditCard, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">CTM Loop</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Connexion
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  La Gestion RH & Paie <span className="text-primary">Réinventée</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Centralisez vos processus RH, automatisez votre paie tunisienne et gérez les présences avec CTM Loop.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card rounded-xl shadow-sm border border-border">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold">Moteur de Paie</h3>
                <p className="text-muted-foreground">Calcul automatique selon le barème tunisien (CNSS, IRPP) en un clic.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card rounded-xl shadow-sm border border-border">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">Multi-Tenancy</h3>
                <p className="text-muted-foreground">Séparation stricte des données par entreprise pour une sécurité maximale.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-card rounded-xl shadow-sm border border-border">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold">Rôles Granulaires</h3>
                <p className="text-muted-foreground">5 niveaux de permissions pour s'adapter à toutes les structures.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 CTM Loop. Tous droits réservés. Fabriqué en Tunisie.</p>
      </footer>
    </div>
  );
}
