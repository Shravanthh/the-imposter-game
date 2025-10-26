export default function BackgroundEffects() {
  return (
    <>
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[600px] bg-gradient-to-r from-primary/20 via-cyan-accent/30 to-primary/20 rounded-full blur-3xl animate-aurora"></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[400px] bg-gradient-to-r from-secondary/10 via-accent-gold/20 to-secondary/10 rounded-full blur-3xl animate-aurora-2"></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[500px] bg-gradient-to-r from-accent-teal/15 via-primary/25 to-accent-teal/15 rounded-full blur-3xl animate-aurora-3"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute -right-24 bottom-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-2xl blur-2xl animate-float -rotate-45" style={{ animationDelay: '1s' }}></div>
    </>
  );
}