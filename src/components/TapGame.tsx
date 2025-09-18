import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TapGame = () => {
  const [score, setScore] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<Array<{id: number, value: number, x: number, y: number}>>([]);
  const [nextFloatingId, setNextFloatingId] = useState(0);

  const handleTap = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setScore(prev => prev + clickPower);
    setIsAnimating(true);
    
    // Создаем плавающий текст в месте клика
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newFloatingText = {
      id: nextFloatingId,
      value: clickPower,
      x,
      y
    };
    
    setFloatingTexts(prev => [...prev, newFloatingText]);
    setNextFloatingId(prev => prev + 1);
    
    // Убираем анимацию и плавающий текст
    setTimeout(() => {
      setIsAnimating(false);
      setFloatingTexts(prev => prev.filter(text => text.id !== newFloatingText.id));
    }, 1000);
  }, [clickPower, nextFloatingId]);

  const buyUpgrade = useCallback((cost: number, powerIncrease: number) => {
    if (score >= cost) {
      setScore(prev => prev - cost);
      setClickPower(prev => prev + powerIncrease);
    }
  }, [score]);

  // Автоматическое сохранение прогресса
  useEffect(() => {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
      const { score: savedScore, clickPower: savedPower } = JSON.parse(saved);
      setScore(savedScore);
      setClickPower(savedPower);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tapGameSave', JSON.stringify({ score, clickPower }));
  }, [score, clickPower]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const upgrades = [
    { name: "Улучшенный палец", cost: 50, power: 1, description: "+1 к силе клика" },
    { name: "Железный кулак", cost: 200, power: 5, description: "+5 к силе клика" },
    { name: "Молот силы", cost: 1000, power: 25, description: "+25 к силе клика" },
    { name: "Легендарная перчатка", cost: 5000, power: 100, description: "+100 к силе клика" },
    { name: "Киберулучшение", cost: 15000, power: 250, description: "+250 к силе клика" },
    { name: "Плазменный усилитель", cost: 50000, power: 750, description: "+750 к силе клика" },
    { name: "Квантовый щелчок", cost: 150000, power: 2000, description: "+2000 к силе клика" },
    { name: "Мультивселенная", cost: 500000, power: 5000, description: "+5000 к силе клика" },
    { name: "Бесконечная сила", cost: 1500000, power: 12500, description: "+12500 к силе клика" },
    { name: "Божественное касание", cost: 5000000, power: 30000, description: "+30000 к силе клика" },
  ];

  console.log('upgrades' + upgrades)

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      {/* Космический фон с анимацией */}
      <div className="fixed inset-0 bg-gradient-cosmic animate-cosmic-rotate -z-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-background/80 via-card/60 to-muted/40 -z-10" />
      
      {/* Плавающие частицы */}
      <div className="fixed inset-0 -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Счетчик очков */}
      <Card className="mb-8 p-8 bg-card/90 backdrop-blur-md border-primary/30 shadow-cosmic relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer opacity-30" />
        <div className="text-center relative z-10">
          <h1 className="text-7xl font-black bg-gradient-rainbow bg-clip-text text-transparent mb-4 animate-float drop-shadow-2xl">
            {formatNumber(score)}
          </h1>
          <Badge variant="secondary" className="text-xl px-6 py-3 bg-gradient-secondary shadow-glow-secondary animate-pulse-glow">
            ⚡ Сила клика: {clickPower} ⚡
          </Badge>
        </div>
      </Card>

      {/* Главная кнопка для тапания */}
      <div className="relative mb-12">
        <Button
          variant="rainbow"
          size="mega"
          onClick={handleTap}
          className={`relative overflow-hidden shadow-cosmic transform transition-all duration-300 hover:scale-110 ${
            isAnimating ? 'animate-bounce-in scale-125' : 'animate-pulse-glow hover:shadow-glow'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer" />
          <span className="relative z-10 text-3xl font-black drop-shadow-lg">✨ ТАП! ✨</span>
          
          {/* Множественные эффекты волн при клике */}
          {isAnimating && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping animation-delay-150" />
              <div className="absolute inset-0 rounded-full border-1 border-secondary animate-ping animation-delay-300" />
            </>
          )}
        </Button>
        
        {/* Плавающие числа */}
        {floatingTexts.map(text => (
          <div
            key={text.id}
            className="absolute pointer-events-none text-accent font-black text-4xl animate-bounce-in z-20 drop-shadow-2xl"
            style={{
              left: text.x,
              top: text.y,
              animation: 'bounce-in 1s ease-out forwards, fadeOut 1s ease-out 0.5s forwards',
              textShadow: '0 0 20px currentColor'
            }}
          >
            ✨+{text.value}✨
          </div>
        ))}
      </div>

      {/* Магазин улучшений */}
      <Card className="w-full max-w-2xl p-8 bg-card/90 backdrop-blur-md border-primary/30 shadow-cosmic relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer opacity-20" />
        <h2 className="text-3xl font-black mb-6 text-center bg-gradient-rainbow bg-clip-text text-transparent relative z-10 drop-shadow-lg">
          🛒 Магазин улучшений 🛒
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades.map((upgrade, index) => {
            const canAfford = score >= upgrade.cost;
            return (
              <Card key={index} className={`p-6 transition-all duration-500 hover:scale-105 hover:rotate-1 relative overflow-hidden ${
                canAfford ? 'border-accent shadow-glow-accent bg-gradient-to-br from-card to-accent/10' : 'border-muted bg-gradient-to-br from-card to-muted/10'
              }`}>
                <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer opacity-10" />
                <div className="relative z-10">
                  <h3 className="font-black text-xl mb-2 bg-gradient-primary bg-clip-text text-transparent">{upgrade.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{upgrade.description}</p>
                  <Button
                    variant={canAfford ? "tap" : "outline"}
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => buyUpgrade(upgrade.cost, upgrade.power)}
                    className={`w-full transition-all duration-300 ${canAfford ? 'animate-pulse-glow shadow-glow' : ''}`}
                  >
                    💎 {formatNumber(upgrade.cost)} очков
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

    </div>
  );
};

export default TapGame;