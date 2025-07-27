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
  ];

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      {/* Фон с эффектом */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-muted -z-10" />
      
      {/* Счетчик очков */}
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm border-primary/20">
        <div className="text-center">
          <h1 className="text-6xl font-black bg-gradient-primary bg-clip-text text-transparent mb-2">
            {formatNumber(score)}
          </h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Сила клика: {clickPower}
          </Badge>
        </div>
      </Card>

      {/* Главная кнопка для тапания */}
      <div className="relative mb-8">
        <Button
          variant="rainbow"
          size="mega"
          onClick={handleTap}
          className={`relative overflow-hidden ${isAnimating ? 'animate-bounce-in' : 'animate-pulse-glow'}`}
        >
          <span className="relative z-10">ТАП!</span>
          
          {/* Эффект волн при клике */}
          {isAnimating && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
          )}
        </Button>
        
        {/* Плавающие числа */}
        {floatingTexts.map(text => (
          <div
            key={text.id}
            className="absolute pointer-events-none text-accent font-bold text-2xl animate-bounce-in z-20"
            style={{
              left: text.x,
              top: text.y,
              animation: 'bounce-in 1s ease-out forwards, fadeOut 1s ease-out 0.5s forwards'
            }}
          >
            +{text.value}
          </div>
        ))}
      </div>

      {/* Магазин улучшений */}
      <Card className="w-full max-w-2xl p-6 bg-card/80 backdrop-blur-sm border-primary/20">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-secondary bg-clip-text text-transparent">
          Магазин улучшений
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades.map((upgrade, index) => {
            const canAfford = score >= upgrade.cost;
            return (
              <Card key={index} className={`p-4 transition-all duration-300 hover:scale-105 ${canAfford ? 'border-accent' : 'border-muted'}`}>
                <h3 className="font-bold text-lg mb-2">{upgrade.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{upgrade.description}</p>
                <Button
                  variant={canAfford ? "tap" : "outline"}
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => buyUpgrade(upgrade.cost, upgrade.power)}
                  className="w-full"
                >
                  {formatNumber(upgrade.cost)} очков
                </Button>
              </Card>
            );
          })}
        </div>
      </Card>

    </div>
  );
};

export default TapGame;