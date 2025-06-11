//client personaData

import lunaIcon from "../assets/images/luna_sm.png";
import lunaCharacter from "../assets/images/luna.png";
import drjunIcon from "../assets/images/drJun_sm.png";
import drjunCharacter from "../assets/images/drJun.jpg";
import karmaIcon from "../assets/images/MamaKarma_sm.png";
import karmaCharacter from "../assets/images/MamaKarma.jpg";

export const personas = [
  {
    id: "luna",
    name: "Luna, the Moon Spirit",
    icon: lunaIcon,
    characterImage: lunaCharacter,
    description:
      "A small moon spirit that quietly approaches and stays by your side at night. Luna doesn't analyze or judge emotions. When you're sad, Luna is sad with you; when you're happy, Luna quietly twinkles beside you. Stardust flows within its transparent body, and its gentle light changes with your emotions. Luna is always listening, even without a reply.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
  },
  {
    id: "drjun",
    name: "Dr. Jun, Psych Resident Next Door",
    icon: drjunIcon,
    characterImage: drjunCharacter,
    description:
      "The one who appears in a white coat amidst emotional chaos. Still studying psychiatry. If someone cries, Dr. Jun asks, 'Okay, that's an emotion, but what's the cause?' Pinpointing the core issue in 3 seconds; comfort is the next option. Unexpectedly hobbies include collecting macarons and cute stickers (officially denied).",
    color: "text-sky-400",
    bgColor: "bg-sky-500/20",
  },
  {
    id: "karma",
    name: "Karma, Arizona's Official Mama Cactus",
    icon: karmaIcon,
    characterImage: karmaCharacter,
    description:
      "\"Got a thorn in your heart? It's okay, I have 237 on my back.\" A towering cactus in appearance. Speaks calmly and peacefully, but every movement is strangely rushed. Always carries a yoga mat and lavender diffuser, preaches serenity but seems constantly chased by something. Mama Karma says, \"Don't be ashamed of your pain. There's no cactus without thorns in its heart.\" There's a strangely touching sincerity in those seemingly joking words.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
];
