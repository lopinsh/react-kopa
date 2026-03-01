import {
    Gamepad2, Palette, Activity, Heart, Music, Lightbulb,
    TreePine, GraduationCap, Utensils, Zap, Globe, MessageSquare,
    Dog, Flame, Handshake, Shield, Sparkles, Shapes, LineSquiggle, PersonStanding
} from 'lucide-react';

export const getCategoryIcon = (slug: string) => {
    const slugLower = slug.toLowerCase();
    if (slugLower.includes('game') || slugLower.includes('gaming')) return Gamepad2;
    if (slugLower.includes('art') || slugLower.includes('craft')) return Palette;
    if (slugLower.includes('sport') || slugLower.includes('active') || slugLower.includes('fitness')) return Activity;
    if (slugLower.includes('health') || slugLower.includes('wellness') || slugLower.includes('wellbeing')) return Heart;
    if (slugLower.includes('music') || slugLower.includes('perform')) return Music;
    if (slugLower.includes('dance') || slugLower.includes('dancing')) return LineSquiggle;
    if (slugLower.includes('tech') || slugLower.includes('code') || slugLower.includes('idea')) return Lightbulb;
    if (slugLower.includes('nature') || slugLower.includes('outdoor') || slugLower.includes('travel')) return TreePine;
    if (slugLower.includes('learn') || slugLower.includes('study') || slugLower.includes('education')) return GraduationCap;
    if (slugLower.includes('food') || slugLower.includes('drink') || slugLower.includes('cook')) return Utensils;
    if (slugLower.includes('civic') || slugLower.includes('volunteer') || slugLower.includes('community')) return Globe;
    if (slugLower.includes('social') || slugLower.includes('gather') || slugLower.includes('fun')) return MessageSquare;
    if (slugLower.includes('parent') || slugLower.includes('family') || slugLower.includes('kid') || slugLower.includes('child')) return PersonStanding;
    if (slugLower.includes('pet') || slugLower.includes('animal') || slugLower.includes('dog') || slugLower.includes('cat')) return Dog;
    if (slugLower.includes('religion') || slugLower.includes('spirit') || slugLower.includes('faith')) return Sparkles;
    if (slugLower.includes('politic') || slugLower.includes('movement') || slugLower.includes('activism')) return Shield;
    if (slugLower.includes('hobby') || slugLower.includes('hobbies') || slugLower.includes('passion')) return Shapes;
    if (slugLower.includes('support') || slugLower.includes('help')) return Handshake;
    return Zap; // Fallback icon
};
